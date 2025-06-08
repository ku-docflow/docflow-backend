import { Injectable } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { Message } from '../chatroom/message.entity';
import { AIService } from '../AI/AI.service';
import { QuestionRepository } from './question.repository';
import { QdrantSearchParams } from '../qdrant/qdrant.interface';
import { QdrantQueryPointEntity } from './points.entity';
import { SearchBotReferenceDto, SearchBotResponseDto } from './dto/question.res.dto';
import { SemanticSearchRequestDto } from './dto/question.req.dto';
import { DocumentService } from '../document/document.service';
import { Document } from '../document/document.entity';
import { SearchBotApi } from '../py/api';
import { SearchDocumentRequest, SearchDocumentResponse } from '../py/dto/pythonApiDto';
import { ChatroomService } from '../chatroom/chatroom.service';

@Injectable()
export class QuestionService {
	constructor(private readonly chatService: ChatService, private readonly AIService: AIService, private readonly chatRoomService: ChatroomService,
				private readonly docService: DocumentService, private readonly questionRepository: QuestionRepository) {
	}


	// Rag
	async getRagSearch(query: SemanticSearchRequestDto): Promise<SearchBotResponseDto> {
		console.log('Rag Search 수행');
		const payloads: SearchBotReferenceDto[] = await this.queryMessageContext(query.chatRoomId, query.query);
		// const pointIds = queryPoint.extractIds
		console.log('payloads', payloads);
		// 메인 DB 조회 :: Document 조회
		const docIds: number[] = payloads.map((payload) => payload.documentId);
		const documents: Document[] = await this.docService.getDocByIds(docIds);
		// 파이썬 서버 호출
		const api = new SearchBotApi();
		const ragRequest: SearchDocumentRequest = {
			references: documents.map((doc) => {
				return { title: doc.text.split('\n')[0].trim(), content: doc.text };
			}),
			userQuery: query.query,
		};
		console.log('ragReq', ragRequest);
		const pythonResponse: SearchDocumentResponse = await api.searchDocument(ragRequest);
		console.log('pythonResponse', pythonResponse);

		const response: SearchBotResponseDto = { ragResponse: pythonResponse.data?.ragResponse, references: payloads };

		return response;

	}

	// Search
	async getSearch(query: SemanticSearchRequestDto): Promise<SearchBotReferenceDto[]> {
		const payloads: SearchBotReferenceDto[] = await this.queryMessageContext(query.chatRoomId, query.query);
		console.log(payloads);
		return payloads;
	}


	// 최상위 모듈 일단 만
	private async queryMessageContext(chatroom_id: number, queryText: string): Promise<SearchBotReferenceDto[]> {
		const THIRTY_MINUTES_BEFORE = 30;
		const chatList: Message[] = await this.chatService.getMessagesByRoomIdAndMinutes(chatroom_id, THIRTY_MINUTES_BEFORE);
		// chatroom으로 org id를 들고 와야 함 (보안 주의)
		// -> chatroom이 속한 org 조회  + 해당 org- userId 검사해서 소속된 userId인지 검사.
		const OrgID = await this.chatRoomService.getOrgIdByChatroomId(chatroom_id);// message 가공
		const chatStringWithSender: string = Message.formatMessagesWithLabels(chatList);
		console.log('chat list', chatStringWithSender);
		// AI
		const question: string = await this.AIService.getQuestionByChatContextString(queryText, chatStringWithSender);
		console.log('question', question);
		// embedding 생성
		const embedding: number[] = await this.AIService.createEmbedding(question);
		// 유사문서 검색 & rerank
		const query: QdrantSearchParams = {
			organizationId: OrgID,
			denseVector: embedding,
			queryText: question,
		};
		console.log('Qdrant Query', query);
		const points: QdrantQueryPointEntity = await this.questionRepository.getDocsByHybridSearchAndOrgId(query);

		return points.extractPayloadPairs;
	}
}


