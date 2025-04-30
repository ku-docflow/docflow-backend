import {
	WebSocketGateway,
	WebSocketServer,
	OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { EventManager } from '../events/event-manager';

@WebSocketGateway({ cors: true })
export class UserGateway implements OnModuleInit, OnGatewayConnection {
	@WebSocketServer()
	server: Server;

	constructor(private readonly events: EventManager) { }

	onModuleInit() {
		this.events.on('user.data_dirty', ({ userIds, chatroomIds }) => {
			const uniqueIds = new Set(userIds);
			uniqueIds.forEach((userId) => {
				this.server.to(`user-${userId}`).emit('refresh_required', {
					chatroomIds,
				});
			});
		});
	}

	handleConnection(client: Socket) {
		const userId = client.handshake.query.user_id;
		if (typeof userId === 'string') {
			client.join(`user-${userId}`);
		} else {
			client.disconnect();
		}
	}
}
