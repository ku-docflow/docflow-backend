import {
	WebSocketGateway,
	WebSocketServer,
	SubscribeMessage,
	MessageBody,
	WsException,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { SemanticSearchRequestDto } from 'src/modules/question/dto/question.req.dto';
import { SearchBotReferenceDto } from 'src/modules/question/dto/question.res.dto';
import { QuestionService } from 'src/modules/question/question.service';

@WebSocketGateway({ cors: true })
export class QuestionGateway {
	@WebSocketServer()
	server: Server;

	constructor(private readonly questionService: QuestionService) { }

	@SubscribeMessage('question_search')
	async handleQuestionSearch(
		@MessageBody()
		payload: {
			chatroom_id: number;
			message: SemanticSearchRequestDto;
		},
	) {
		try {
			const results: SearchBotReferenceDto[] = await this.questionService.getSearch(payload.message);

			this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
				sender_id: 'search-bot',
				text: results.map(r => `${r.title} [${r.category}] — ${r.summary}`).join('\n'),
				mentions: [],
			});
		} catch (err) {
			throw new WsException('Search failed');
		}
	}
}
