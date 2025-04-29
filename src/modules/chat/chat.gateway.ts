import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException, } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { QueryFailedError } from 'typeorm';

@WebSocketGateway({ cors: true })
export class ChatGateway {
	@WebSocketServer()
	server: Server;

	constructor(private readonly chatService: ChatService) { }

	@SubscribeMessage('send_message')
	async handleSendMessage(
		@MessageBody()
		payload: {
			chatroom_id: number;
			sender_id: string;
			text: string;
		},
	) {
		try {
			const saved = await this.chatService.saveMessage(
				payload.chatroom_id,
				payload.sender_id,
				payload.text,
			);

			this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
				id: saved.id,
				chatroom_id: saved.chatroom_id,
				sender_id: saved.sender_id,
				text: saved.text,
				timestamp: saved.timestamp,
			});
		} catch (err) {
			if (err instanceof QueryFailedError && (err as any).code === '23503') {
				throw new WsException('Chatroom or User does not exist');
			}
		}
	}

	async handleConnection(client: Socket) {
		const userId = client.handshake.query.user_id;

		if (typeof userId !== 'string' || !userId.trim()) {
			client.disconnect();
			return;
		}

		try {
			const chatroomIds = await this.chatService.findChatroomIdsByUserId(userId);
			chatroomIds.forEach((id) => {
				client.join(`room-${id}`);
			});
		} catch (err) {
			client.disconnect();
		}
	}
}
