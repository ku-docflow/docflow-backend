import { InternalServerErrorException, Logger } from '@nestjs/common';
import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
	WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from 'src/modules/chat/chat.service';
import { SendMessageDto } from 'src/modules/chatroom/dto/send_message.dto';
import { SearchBotResponseDto } from 'src/modules/question/dto/question.res.dto';
import { QuestionService } from 'src/modules/question/question.service';
import { QueryFailedError } from 'typeorm';
import { SemanticSearchRequestDto } from '../../modules/question/dto/question.req.dto';
import { OnEvent } from '@nestjs/event-emitter';
import { Message } from '../../modules/chatroom/message.entity';

@WebSocketGateway({ cors: true })
export class ChatGateway {
	@WebSocketServer()
	server: Server;

	private logger = new Logger('ChatGateway');

	constructor(private readonly chatService: ChatService, private readonly questionService: QuestionService) {
	}

	@SubscribeMessage('send_message')
	async handleSendMessage(
		@MessageBody()
		payload: {
			chatroom_id: number;
			is_searchbot: boolean;
			message: SendMessageDto;
		},
	) {
		try {
			console.log(payload.message.sender_id);
			const fullMessage = { ...payload.message, chatroom_id: payload.chatroom_id };
			const saved = await this.chatService.saveMessage(fullMessage);

			this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
				...saved,
				mentions: saved?.mentions ?? [],
				shared_message_id: saved?.shared_message_id ?? null,
				shared_message_text: saved?.shared_message_text ?? null,
				shared_message_sender: {
					id: saved?.sender.id,
					first_name: saved?.sender.first_name,
					last_name: saved?.sender.last_name,
					profile_image: '',
				}
				,
			});
			if (payload.is_searchbot) {
				const semanticQuery: SemanticSearchRequestDto = {
					query: payload.message.text,
					chatRoomId: payload.chatroom_id,
				};
				const results: SearchBotResponseDto = await this.questionService.getRagSearch(semanticQuery);
				const botMessage: SendMessageDto & { chatroom_id: number } = {
					sender_id: 'search-bot',
					chatroom_id: payload.chatroom_id,
					text: results.ragResponse,
					mentions: [],
					type: payload.message.type, // 없으면 기본값 지정
				};
				const savedBotMessage = await this.chatService.saveMessage(botMessage).catch((e) => {
					throw new InternalServerErrorException(`botMessage 저장에 실패했습니다 ${e}`);
				});
				console.log(41414, savedBotMessage);

				this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
					...savedBotMessage,
					mentions: savedBotMessage?.mentions ?? [],
					shared_message_id: savedBotMessage?.shared_message_id ?? null,
					shared_message_text: savedBotMessage?.shared_message_text ?? null,
					shared_message_sender:
					{
						id: savedBotMessage?.sender.id,
						first_name: savedBotMessage?.sender.first_name,
						last_name: savedBotMessage?.sender.last_name,
						profile_image: '',
					},
				});
			}
		} catch (err) {
			if (err instanceof QueryFailedError && (err as any).code === '23503') {
				throw new WsException('Chatroom or User does not exist');
			}
		}
	}

	@OnEvent('gen-bot.completed')
	handleGenBotCompleted(message: Message) {
		this.server.to(`room-${message.chatroom_id}`).emit('receive_message', {
			...message,
			mentions: message.mentions ?? [],
			shared_message_id: message.shared_message_id ?? null,
			shared_message_text: message.shared_message_text ?? null,
			shared_message_sender:
			{
				id: message?.sender.id,
				first_name: message?.sender.first_name,
				last_name: message?.sender.last_name,
				profile_image: '',
			},
		});
	}

	handleConnection(client: Socket) {
		const userId = client.handshake.query.user_id;
		if (typeof userId === 'string') {
			this.logger.log(`Connected: ${userId} (${client.id})`);
		} else {
			this.logger.warn(`Connection rejected: missing user_id`);
			client.disconnect();
		}
	}

	handleDisconnect(client: Socket) {
		const userId = client.handshake.query.user_id;
		this.logger.log(`Disconnected: ${userId} (${client.id})`);
	}

	@SubscribeMessage('join_room')
	handleJoinRoom(
		@MessageBody() data: { chatroom_id: number },
		@ConnectedSocket() client: Socket,
	) {
		client.join(`room-${data.chatroom_id}`);
	}
}
