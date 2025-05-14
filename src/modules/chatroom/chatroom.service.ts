import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { Chatroom } from './chatroom.entity';
import { Message } from './message.entity';
import { ChatroomParticipant } from './chatroom-participant.entity';
import { EventManager } from 'src/common/events/event-manager';
import { Topic } from '../topic/topic.entity';

@Injectable()
export class ChatroomService {
	constructor(
		@InjectRepository(Chatroom)
		private chatroomRepo: Repository<Chatroom>,
		@InjectRepository(Message)
		private messageRepo: Repository<Message>,
		@InjectRepository(ChatroomParticipant)
		private participantRepo: Repository<ChatroomParticipant>,
		@InjectRepository(Topic)
		private topicRepo: Repository<Topic>,
		private readonly eventManager: EventManager,
	) {
	}

	async getMessagesByTeamId(teamId: number) {
		const chatroom = await this.chatroomRepo.findOne({
			where: { team_id: teamId },
		});
		if (!chatroom) throw new NotFoundException('Chatroom not found');

		const messages = await this.messageRepo.find({
			where: { chatroom_id: chatroom.id },
			relations: ['sender'],
			order: { timestamp: 'ASC' },
		});

		return {
			chatroom_id: chatroom.id.toString(),
			messages,
		};
	}

	async getDirectMessages(userId: string, peerId: string) {
		const dmKey = [userId, peerId].sort().join('-');

		let chatroom = await this.chatroomRepo.findOneBy({ dm_key: dmKey });

		if (!chatroom) {
			chatroom = await this.chatroomRepo.save(
				this.chatroomRepo.create({
					type: 'dm',
					dm_key: dmKey,
				}),
			);

			this.eventManager.emit('user.chatroom_join', {
				userId,
				chatroomIds: [chatroom.id],
			});

			this.eventManager.emit('user.chatroom_join', {
				userId: peerId,
				chatroomIds: [chatroom.id],
			});

			await this.participantRepo.save([
				this.participantRepo.create({
					user_id: userId,
					chatroom_id: chatroom.id,
				}),
				this.participantRepo.create({
					user_id: peerId,
					chatroom_id: chatroom.id,
				}),
			]);
		}

		const messages = await this.messageRepo.find({
			where: { chatroom_id: chatroom.id },
			order: { timestamp: 'ASC' },
			relations: ['sender'],
		});

		return {
			chatroom_id: chatroom.id.toString(),
			messages,
		};
	}

	async getOrgIdByChatroomId(chatroomId: number): Promise<number | null> {
		const chatroom = await this.chatroomRepo.findOne({
			where: { id: chatroomId },
			relations: ['team', 'team.organization'],
		});
		if (!chatroom) {
			throw new NotFoundException('chatroom ID not found for this chatroom');
		}

		const result = chatroom.team ? chatroom.team.organization.id : null;
		return result;
	}

	async getOrgIdByTopicId(topicId: number): Promise<number> {
		const topic = await this.topicRepo.findOne({
			where: {
				id: topicId,
			},
		});
		if(!topic){
			throw new NotFoundException(`Topic Not Found ${topicId}`)
		}
		return topic.organization_id;

	}

	async getMessagesBetweenIds(
		chatroom_id: number,
		first_msg_id: number,
		last_msg_id: number,
	): Promise<Message[]> {
		const first = await this.messageRepo.findOne({
			where: { id: first_msg_id, chatroom_id },
			select: ['timestamp'],
		});
		const last = await this.messageRepo.findOne({
			where: { id: last_msg_id, chatroom_id },
			select: ['timestamp'],
		});
		if (!first || !last) {
			return [];
		}
		const start = first.timestamp < last.timestamp ? first.timestamp : last.timestamp;
		const end = first.timestamp > last.timestamp ? first.timestamp : last.timestamp;
		return this.messageRepo.find({
			where: {
				chatroom_id,
				timestamp: Between(start, end),
			},
			order: {
				timestamp: 'DESC',
			},
		});
	}

}
