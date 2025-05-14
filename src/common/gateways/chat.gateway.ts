import {Logger} from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    WsException,
} from '@nestjs/websockets';
import {Server, Socket} from 'socket.io';
import {ChatService} from 'src/modules/chat/chat.service';
import {SendMessageDto} from 'src/modules/chatroom/dto/send_message.dto';
import {SearchBotReferenceDto, SearchBotResponseDto} from 'src/modules/question/dto/question.res.dto';
import {QuestionService} from 'src/modules/question/question.service';
import {QueryFailedError} from 'typeorm';
import {SemanticSearchRequestDto} from "../../modules/question/dto/question.req.dto";

@WebSocketGateway({cors: true})
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
            const fullMessage = {...payload.message, chatroom_id: payload.chatroom_id};
            const saved = await this.chatService.saveMessage(fullMessage);

            this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
                ...saved,
                mentions: saved.mentions ?? [],
                shared_message_id: saved.shared_message_id ?? null,
                shared_message_sender_id: saved.shared_message_sender_id ?? null,
            });
            console.log(payload)
            if (payload.is_searchbot) {
                const semanticQuery: SemanticSearchRequestDto = {
                    query: payload.message.text,
                    chatRoomId: payload.chatroom_id,
                }
                console.log(semanticQuery);
                const results: SearchBotResponseDto = await this.questionService.getRagSearch(semanticQuery);
                console.log('results',results);
                this.server.to(`room-${payload.chatroom_id}`).emit('receive_message', {
                    sender_id: '검색봇',
                    text: results.ragResponse,
                    // text: results.map(r => `${r.title} [${r.category}] — ${r.summary}`).join('\n'),
                    mentions: [],
                });
            }
        } catch (err) {
            if (err instanceof QueryFailedError && (err as any).code === '23503') {
                throw new WsException('Chatroom or User does not exist');
            }
        }
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
