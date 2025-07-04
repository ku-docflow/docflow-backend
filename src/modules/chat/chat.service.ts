import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Mention, Message, MessageType } from '../chatroom/message.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';
import { SendMessageDto } from '../chatroom/dto/send_message.dto';

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Message)
		private readonly messageRepo: Repository<Message>,
		@InjectRepository(ChatroomParticipant)
		private readonly participantRepo: Repository<ChatroomParticipant>,
	) {
	}

	async saveMessage(message: SendMessageDto & { chatroom_id: number }) {
		const savedMessage = this.messageRepo.create(message);
		const saved = await this.messageRepo.save(savedMessage);
		const result = await this.messageRepo.findOne({
			where: { id: saved.id },
			relations: ['sender'],
		});
		if (!result) {
			throw new NotFoundException('저장된 메세지 조회에 실패');
		}
		return result;

	}

	async getMessages(chatroom_id: number) {
		const messages = await this.messageRepo.find({
			where: { chatroom_id },
			order: { timestamp: 'ASC' },
			relations: ['sender', 'shared_message_sender'],
		});

		return {
			chatroom_id: chatroom_id.toString(),
			messages: messages.map((msg) => ({
				id: msg.id.toString(),
				text: msg.text,
				chatroom_id: msg.chatroom_id.toString(),
				timestamp: msg.timestamp.toISOString(),
				type: msg.type,
				sender: {
					id: msg.sender.id,
					first_name: msg.sender.first_name,
					last_name: msg.sender.last_name,
					profile_image: '',
				},
				mentions: msg.mentions ?? [],
				shared_message_id: msg.shared_message_id?.toString() ?? null,
				shared_message_text: msg.shared_message_text?.toString() ?? null,
				shared_message_sender: msg.shared_message_sender
					? {
						id: msg.shared_message_sender.id,
						first_name: msg.shared_message_sender.first_name,
						last_name: msg.shared_message_sender.last_name,
						profile_image: '',
					}
					: null,
			})),
		};
	}

	async findChatroomIdsByUserId(userId: string): Promise<number[]> {
		const participations = await this.participantRepo.find({
			where: { user_id: userId },
			select: ['chatroom_id'],
		});

		return participations.map((p) => p.chatroom_id);
	}

	async getMessagesByRoomIdAndMinutes(chatroom_id: number, minutes: number): Promise<Message[]> {
		const MinutesAgo = new Date(Date.now() - minutes * 60 * 1000);

		const messages = await this.messageRepo.find({
			where: {
				chatroom_id,
				timestamp: MoreThan(MinutesAgo),
			},
			order: { timestamp: 'DESC' },
			take: 15,
		});
		console.log(messages);
		if (!messages) {
			throw new NotFoundException('메세지 찾을 수 없습니다.');
		}
		return messages;
	}

}
