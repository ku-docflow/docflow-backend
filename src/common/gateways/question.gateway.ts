// import {
// 	WebSocketGateway,
// 	WebSocketServer,
// 	SubscribeMessage,
// 	MessageBody,
// 	WsException,
// } from '@nestjs/websockets';
// import { Server } from 'socket.io';
// import { ChatService } from 'src/modules/chat/chat.service';
// import { SemanticSearchRequestDto } from 'src/modules/question/dto/question.req.dto';
// import { SearchBotReferenceDto } from 'src/modules/question/dto/question.res.dto';
// import { QuestionService } from 'src/modules/question/question.service';
//
// @WebSocketGateway({ cors: true })
// export class QuestionGateway {
// 	@WebSocketServer()
// 	server: Server;
//
// 	constructor(private readonly questionService: QuestionService,
// 		private readonly chatService: ChatService) { }
//
// 	@SubscribeMessage('question_search')
// 	async handleQuestionSearch(
// 		@MessageBody()
// 		payload: {
// 			chatroom_id: number;
// 			is_search: boolean;
// 			message: SemanticSearchRequestDto;
// 		},
// 	) {
// 		try {
// 			const results: SearchBotReferenceDto[] = await this.questionService.getSearch(payload.message);
//
// 			const fullMessage = { ...payload.message, chatroom_id: payload.chatroom_id };
// 			const saved = await this.chatService.saveMessage(fullMessage);
//
// 			this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
// 				...saved,
// 				mentions: saved.mentions ?? [],
// 				shared_message_id: saved.shared_message_id ?? null,
// 				shared_message_sender_id: saved.shared_message_sender_id ?? null,
// 			});
//
// 			this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
// 				sender_id: '검색봇',
// 				text: results.map(r => `${r.title} [${r.category}] — ${r.summary}`).join('\n'),
// 				mentions: [],
// 			});
// 		} catch (err) {
// 			throw new WsException('Search failed');
// 		}
// 	}
// }
