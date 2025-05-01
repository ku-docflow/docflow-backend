import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Mention, Message, MessageType } from '../chatroom/message.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepo: Repository<Message>,

		@InjectRepository(ChatroomParticipant)
		private readonly participantRepo: Repository<ChatroomParticipant>,
	) {
	}

	async saveMessage(chatroom_id: number, sender_id: string, text: string, mentions: Mention[] = [], type: MessageType = MessageType.default) {
		const message = this.messageRepo.create({
			chatroom_id,
			sender_id,
			text,
			mentions,
			type
		});
		return this.messageRepo.save(message);
	}

	// desc / cursor pagination
	async getMessages(chatroom_id: number) {
		return this.messageRepo.find({
			where: { chatroom_id },
			order: { timestamp: 'ASC' },
		});
	}

	async findChatroomIdsByUserId(userId: string): Promise<number[]> {
		const participations = await this.participantRepo.find({
			where: { user_id: userId },
			select: ['chatroom_id'],
		});

		return participations.map((p) => p.chatroom_id);
	}

	async getMessagesByRoomIdAndMinutes(chatroom_id: number, minutes: number): Promise<Message[]> {
		const thirtyMinutesAgo = new Date(Date.now() - minutes * 60 * 1000);

		return this.messageRepo.find({
			where: {
				chatroom_id,
				timestamp: MoreThan(thirtyMinutesAgo),
			},
			order: { timestamp: 'DESC' },
			take: 6,
		});
	}
}
