import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Membership } from '../team/membership.entity';
import { Repository } from 'typeorm';
import { Team } from '../team/team.entity';
import { Chatroom } from '../chatroom/chatroom.entity';
import { EventManager } from 'src/common/events/event-manager';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,

		@InjectRepository(Membership)
		private readonly membershipRepo: Repository<Membership>,

		@InjectRepository(Team)
		private readonly teamRepo: Repository<Team>,

		@InjectRepository(Chatroom)
		private readonly chatroomRepo: Repository<Chatroom>,

		private readonly eventManager: EventManager,
	) { }
	async getInitData(userId: string) {
		const user = await this.userRepo.findOneByOrFail({ id: userId });

		const memberships = await this.membershipRepo.find({
			where: { user_id: userId },
			relations: ['organization', 'team'],
		});

		const orgs = await Promise.all(
			memberships
				.map((m) => m.organization)
				.filter((v, i, arr) => arr.findIndex((o) => o.id === v.id) === i)
				.map(async (org) => {
					const teams = await this.teamRepo.find({
						where: { organization_id: org.id },
						relations: ['chatroom'],
					});

					const teamData = await Promise.all(
						teams.map(async (team) => {
							const memberships = await this.membershipRepo.find({
								where: { team_id: team.id },
								relations: ['user'],
							});

							const peers = await Promise.all(
								memberships.map(async (m) => {
									const dmKey = [userId, m.user_id].sort().join('-');
									const dmChatroom = await this.chatroomRepo.findOneBy({
										dm_key: dmKey,
									});

									return {
										id: m.user.id,
										first_name: m.user.first_name,
										last_name: m.user.last_name,
										chatroom_id: dmChatroom?.id ?? null,
									};
								}),
							);

							return {
								id: team.id.toString(),
								name: team.name,
								chatroom_id: team.chatroom_id?.toString() ?? null,
								peers,
							};
						}),
					);

					return {
						id: org.id.toString(),
						name: org.name,
						admins: org.admins,
						teams: teamData,
					};
				}),
		);

		return {
			user,
			orgs,
		};
	}

	async updateName(userId: string, firstName: string, lastName: string) {
		const user = await this.userRepo.findOneByOrFail({ id: userId });
		user.first_name = firstName;
		user.last_name = lastName;
		await this.userRepo.save(user);

		this.eventManager.emit('user.data_dirty', {
			userIds: [userId],
		});

		return user;
	}
}
