import {Injectable} from '@nestjs/common';
import {ChatService} from "../chat/chat.service";
import {Message} from "../chatroom/message.entity";
import {AIService} from "../AI/AI.service";

@Injectable()
export class QuestionService {
    constructor(private readonly chatService: ChatService, private readonly AIService: AIService) {
    }

    // 최상위 모듈 일단 만
    async getMessageContext(chatroom_id: number) {
        const MINUTES_BEFORE = 30
        const chatList: Message[] = await this.chatService.getMessagesByRoomIdAndMinutes(chatroom_id, MINUTES_BEFORE)

        // message 가공
        const chatStringWithSender: string = Message.formatMessagesWithLabels(chatList)
        // AI
        const question: string = await this.AIService.getQuestionByChatContextString(chatStringWithSender);
        // embedding 생성
        const embedding: number[] = await this.AIService.createEmbedding(question);
        // 유사문서 검색

        // rerank

        // 응답

    }

}


