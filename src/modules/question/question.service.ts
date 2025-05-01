import {Injectable} from '@nestjs/common';
import {ChatService} from "../chat/chat.service";
import {Message} from "../chatroom/message.entity";
import {AIService} from "../AI/AI.service";
import {QuestionRepository} from "./question.repository";
import {QdrantSearchParams} from "../qdrant/qdrant.interface";
import {QdrantQueryPointEntity} from "./points.entity";
import {SearchBotReferenceDto, SearchBotResponseDto} from "./dto/question.res.dto";
import {SemanticSearchRequestDto} from "./dto/question.req.dto";

@Injectable()
export class QuestionService {
    constructor(private readonly chatService: ChatService, private readonly AIService: AIService,
                private readonly questionRepository: QuestionRepository) {
    }


    // Rag
    async getRagSearch(query: SemanticSearchRequestDto): Promise<SearchBotResponseDto> {
        // const queryPoint: QdrantQueryPointEntity = await this.queryMessageContext(chatroomId, queryText)
        // const pointIds = queryPoint.extractIds
        // const payloads = queryPoint.extractPayloadPairs
        //
        // // 메인 DB 조회 :: Document 조회
        // payloads.map((payload) => payload.documentId)
        // 파이썬 서버 호출

        const mockPythonResponse = {
            statusCode: 200,
            message: "성공했습니다",
            data: {
                "ragResponse": "Rag 기반으로 생성된 답변 내용",
            }
        }

        return {
            ragResponse: "bot 이 응답한 결과",
            references: [
                {
                    documentId: "abc123",
                    title: "NestJS 구조 설계 문서",
                    summary: "NestJS 모듈 구성 방식과 DI 흐름 설명",
                    createdBy: "정하나",
                    createdAt: new Date(),
                    category: "DEV_DOC"
                },
            ]
        }
    }

    // Search
    async getSearch(query: SemanticSearchRequestDto): Promise<SearchBotReferenceDto[]> {
        // const queryPoint: QdrantQueryPointEntity = await this.queryMessageContext(chatroomId, queryText)
        // return queryPoint.extractPayloadPairs

        return [{
            documentId: "abc123",
            title: "NestJS 구조 설계 문서",
            summary: "NestJS 모듈 구성 방식과 DI 흐름 설명",
            createdBy: "정하나",
            createdAt: new Date(),
            category: "DEV_DOC"
        }, {
            documentId: "abc123",
            title: "NestJS 구조 회의록",
            summary: "NestJS 모듈 구성 방식과 DI 흐름 설명",
            createdBy: "정하나",
            createdAt: new Date(),
            category: "MEETING_DOC"
        },]
    }

    // 최상위 모듈 일단 만
    private async queryMessageContext(chatroom_id: number, queryText: string): Promise<QdrantQueryPointEntity> {
        const MINUTES_BEFORE = 30
        const chatList: Message[] = await this.chatService.getMessagesByRoomIdAndMinutes(chatroom_id, MINUTES_BEFORE)
        // chatroom으로 org id를 들고 와야 함 (보안 주의)
        // -> chatroom이 속한 org 조회  + 해당 org- userId 검사해서 소속된 userId인지 검사.
        const OrgID = 1
        // message 가공
        const chatStringWithSender: string = Message.formatMessagesWithLabels(chatList)
        // AI
        const question: string = await this.AIService.getQuestionByChatContextString(queryText, chatStringWithSender);
        // embedding 생성
        const embedding: number[] = await this.AIService.createEmbedding(question);
        // 유사문서 검색 & rerank
        const query: QdrantSearchParams = {
            organizationId: OrgID,
            denseVector: embedding,
            queryText: question,
        }
        const points: QdrantQueryPointEntity = await this.questionRepository.getDocsByHybridSearchAndOrgId(query)

        return points
    }
}


