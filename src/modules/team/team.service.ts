import {
	Injectable,
	NotFoundException,
	ForbiddenException,
	BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Team } from './team.entity';
import { Chatroom } from '../chatroom/chatroom.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { Membership } from './membership.entity';
import { JoinTeamDto } from './dto/join-team.dto';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';
import { EventManager } from 'src/common/events/event-manager';

@Injectable()
export class TeamService {
	constructor(
		private readonly dataSource: DataSource,
		private readonly eventManager: EventManager,

		@InjectRepository(Team)
		private readonly teamRepo: Repository<Team>,

		@InjectRepository(Membership)
		private readonly membershipRepo: Repository<Membership>,
	) { }

	async create(dto: CreateTeamDto, user_id: string) {
		try {
			return await this.dataSource.transaction(async (manager) => {
				const teamRepo = manager.getRepository(Team);
				const team = teamRepo.create({
					name: dto.name,
					organization_id: dto.organizationId,
				});
				const savedTeam = await teamRepo.save(team);

				const chatroomRepo = manager.getRepository(Chatroom);
				const chatroom = chatroomRepo.create({
					type: 'group',
					name: dto.name,
					team_id: savedTeam.id,
				});
				const savedChatroom = await chatroomRepo.save(chatroom);

				savedTeam.chatroom_id = savedChatroom.id;
				await teamRepo.save(savedTeam);

				const membership = manager.getRepository(Membership).create({
					user_id,
					organization_id: dto.organizationId,
					team_id: savedTeam.id,
					role: 'admin',
				});
				await manager.getRepository(Membership).save(membership);

				const memberships = await manager.getRepository(Membership).find({
					where: { organization_id: dto.organizationId },
					select: ['user_id'],
				});
				const userIds = memberships.map((m) => m.user_id);
				if (userIds.length > 0) {
					this.eventManager.emit('user.data_dirty', {
						userIds,
						chatroomIds: [savedChatroom.id],
					});
				}

				const participant = manager.getRepository(ChatroomParticipant).create({
					user_id,
					chatroom_id: savedChatroom.id,
				});
				await manager.getRepository(ChatroomParticipant).save(participant);

				return {
					success: true,
					team_id: savedTeam.id,
				};
			});
		} catch (err) {
			if (err instanceof QueryFailedError && (err as any).code === '23503') {
				throw new BadRequestException('Organization not found.');
			}
			throw err;
		}
	}

	async join(dto: JoinTeamDto, user_id: string) {
		const team = await this.teamRepo.findOne({
			where: { id: dto.team_id },
			relations: ['organization', 'chatroom'],
		});
		if (!team) throw new NotFoundException('Team not found');

		const existing = await this.membershipRepo.findOne({
			where: {
				user_id,
				team_id: team.id,
			},
		});
		if (existing) throw new ForbiddenException('Already joined this team');

		const membership = this.membershipRepo.create({
			user_id,
			team_id: team.id,
			organization_id: team.organization_id,
			role: 'member',
		});
		await this.membershipRepo.save(membership);

		if (team.chatroom_id) {
			await this.dataSource.getRepository(ChatroomParticipant).save({
				user_id,
				chatroom_id: team.chatroom_id,
			});
		}

		const members = await this.membershipRepo.find({
			where: { team_id: team.id },
			select: ['user_id'],
		});

		const allTeamMemberIds = members.map((m) => m.user_id);

		this.eventManager.emit('user.data_dirty', {
			userIds: allTeamMemberIds,
			chatroomIds: team.chatroom_id ? [team.chatroom_id] : [],
		});

		return { success: true };
	}

	async delete(id: number) {
		const team = await this.teamRepo.findOneBy({ id });
		if (!team) throw new NotFoundException('Team not found');

		const memberships = await this.membershipRepo.find({
			where: { team_id: id },
			select: ['user_id'],
		});

		const userIds = memberships.map((m) => m.user_id);

		await this.membershipRepo.delete({ team_id: id });
		await this.teamRepo.delete(id);

		if (userIds.length > 0) {
			// TODO: Socket close
			this.eventManager.emit('user.data_dirty', { userIds, chatroomIds: [] });
		}

		return { success: true };
	}
}
