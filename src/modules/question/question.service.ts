import {Injectable} from '@nestjs/common';
import {ChatService} from "../chat/chat.service";
import {Message} from "../chatroom/message.entity";
import {AIService} from "../AI/AI.service";
import {QuestionRepository} from "./question.repository";
import {QdrantSearchParams} from "../qdrant/qdrant.interface";

@Injectable()
export class QuestionService {
    constructor(private readonly chatService: ChatService, private readonly AIService: AIService,
                private readonly questionRepository : QuestionRepository) {
    }

    // 최상위 모듈 일단 만
    async getMessageContext(chatroom_id: number) {
        const MINUTES_BEFORE = 30
        const chatList: Message[] = await this.chatService.getMessagesByRoomIdAndMinutes(chatroom_id, MINUTES_BEFORE)
        //chatroom으로 org id를 들고 와야 함 (보안 주의)

        // message 가공
        const chatStringWithSender: string = Message.formatMessagesWithLabels(chatList)
        // AI
        const question: string = await this.AIService.getQuestionByChatContextString(chatStringWithSender);
        // embedding 생성
        const embedding: number[] = await this.AIService.createEmbedding(question);
        // 유사문서 검색 & rerank
        const query: QdrantSearchParams = {
            orgId: 1,
            denseVector: embedding,
            queryText: question,
        }
         this.questionRepository.getDocsByHybridSearchAndOrgId(query)

        // 응답

    }

}


