import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Org } from './org.entity';
import { CreateOrgDto } from './dto/create-org.dto';
import { EditOrgDto } from './dto/edit-org.dto';
import { Team } from '../team/team.entity';
import { Membership } from '../team/membership.entity';
import { Chatroom } from '../chatroom/chatroom.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';
import { EventManager } from 'src/common/events/event-manager';

@Injectable()
export class OrgService {
	constructor(
		@InjectRepository(Org)
		private readonly orgRepo: Repository<Org>,

		private readonly dataSource: DataSource,
		private readonly eventManager: EventManager
	) { }

	async create(dto: CreateOrgDto, id: string) {
		try {
			const result = await this.dataSource.transaction(async (manager) => {
				const org = manager.create(Org, {
					name: dto.name,
					admins: [id],
				});
				const savedOrg = await manager.save(org);

				const chatroom = manager.create(Chatroom, { type: 'group' });
				const savedChatroom = await manager.save(chatroom);

				const team = manager.create(Team, {
					name: '공지방',
					organization_id: savedOrg.id,
					chatroom_id: savedChatroom.id,
				});
				const savedTeam = await manager.save(team);

				savedChatroom.team_id = savedTeam.id;
				await manager.save(savedChatroom);

				const membership = manager.create(Membership, {
					user_id: id,
					team_id: savedTeam.id,
					organization_id: savedOrg.id,
					role: 'admin',
				});
				await manager.save(membership);

				const participant = manager.create(ChatroomParticipant, {
					user_id: id,
					chatroom_id: savedChatroom.id,
				});
				await manager.save(participant);

				this.eventManager.emit('user.data_dirty', {
					userIds: [id],
					chatroomIds: [savedChatroom.id],
				});

				return {
					success: true,
					org_id: savedOrg.id,
				};
			});

			return result;
		} catch (error) {
			if (error.code === '23505') {
				throw new ConflictException('Organization name already exists.');
			}
			throw error;
		}
	}

	async edit(id: number, dto: EditOrgDto) {
		// TODO: Replace with add / remove admin
		const result = await this.orgRepo.update(id, {
			name: dto.name,
		});

		const members = await this.dataSource.getRepository(Membership).find({
			where: { organization_id: id },
			select: ['user_id'],
		});
		const userIds = members.map((m) => m.user_id);
		if (userIds.length > 0) {
			this.eventManager.emit('user.data_dirty', { userIds, chatroomIds: [] });
		}

		if (result.affected === 0) {
			throw new NotFoundException('Organization not found');
		}

		return { success: true };
	}

	async delete(id: number) {
		const result = await this.orgRepo.delete(id);

		if (result.affected === 0) {
			throw new NotFoundException('Organization not found');
		}

		return { success: true };
	}
}
