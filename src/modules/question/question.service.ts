import {
	Injectable,
	Logger,
	BadRequestException,
	NotFoundException,
	ForbiddenException,
	ServiceUnavailableException,
	InternalServerErrorException,
} from '@nestjs/common';
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
	private readonly logger = new Logger(QuestionService.name);

	constructor(private readonly chatService: ChatService, private readonly AIService: AIService, private readonly chatRoomService: ChatroomService,
				private readonly docService: DocumentService, private readonly questionRepository: QuestionRepository) {
	}


	// Rag
	async getRagSearch(query: SemanticSearchRequestDto): Promise<SearchBotResponseDto> {
		if (!query.query?.trim()) {
			throw new BadRequestException('Query is required and cannot be empty');
		}

		if (!query.chatRoomId || query.chatRoomId <= 0) {
			throw new BadRequestException('Valid chatroom ID is required');
		}

		this.logger.log('Rag Search 수행');
		try {
			this.logger.log(`Starting queryMessageContext with chatRoomId: ${query.chatRoomId}, query: ${query.query}`);
			const payloads: SearchBotReferenceDto[] = await this.queryMessageContext(query.chatRoomId, query.query);
			this.logger.log(`Found ${payloads.length} document references`);

			if (payloads.length === 0) {
				return {
					ragResponse: 'No relevant documents found for your query.',
					references: [],
				};
			}

			// 메인 DB 조회 :: Document 조회
			const docIds: number[] = payloads.map((payload) => payload.documentId);
			const documents: Document[] = await this.docService.getDocByIds(docIds);

			if (documents.length === 0) {
				this.logger.warn('Referenced documents not found');
			}

			// 파이썬 서버 호출
			const api = new SearchBotApi();
			const ragRequest: SearchDocumentRequest = {
				references: documents.map((doc) => {
					return { title: doc.text.split('\n')[0].trim(), content: doc.text };
				}),
				userQuery: query.query,
			};

			const pythonResponse: SearchDocumentResponse = await api.searchDocument(ragRequest);

			if (!pythonResponse.data?.ragResponse) {
				throw new ServiceUnavailableException('Failed to generate AI response');
			}

			const response: SearchBotResponseDto = {
				ragResponse: pythonResponse.data.ragResponse,
				references: payloads,
			};

			this.logger.log('Rag Search completed successfully');
			return response;
		} catch (error) {
			this.logger.error(`Rag Search failed: ${error.message}`, error.stack);
			throw error;
		}
	}

	// Search
	async getSearch(query: SemanticSearchRequestDto): Promise<SearchBotReferenceDto[]> {
		if (!query.query?.trim()) {
			throw new BadRequestException('Query is required and cannot be empty');
		}

		if (!query.chatRoomId || query.chatRoomId <= 0) {
			throw new BadRequestException('Valid chatroom ID is required');
		}

		const payloads: SearchBotReferenceDto[] = await this.queryMessageContext(query.chatRoomId, query.query);
		this.logger.log(`Search completed with ${payloads.length} results`);
		return payloads;
	}


	// 최상위 모듈 일단 만
	private async queryMessageContext(chatroom_id: number, queryText: string): Promise<SearchBotReferenceDto[]> {
		const THIRTY_MINUTES_BEFORE = 30;

		this.logger.log(`Getting messages for chatroom ${chatroom_id} from last ${THIRTY_MINUTES_BEFORE} minutes`);
		const chatList: Message[] = await this.chatService.getMessagesByRoomIdAndMinutes(chatroom_id, THIRTY_MINUTES_BEFORE);
		this.logger.log(`Found ${chatList.length} messages`);

		// chatroom으로 org id를 들고 와야 함 (보안 주의)
		this.logger.log(`Getting OrgID for chatroom ${chatroom_id}`);
		let OrgID: number | null = null;


		OrgID = await this.chatRoomService.getOrgIdByChatroomId(chatroom_id);
		this.logger.log(`OrgID: ${OrgID}`);

		// message 가공
		this.logger.log('Formatting messages with labels');
		const chatStringWithSender: string = Message.formatMessagesWithLabels(chatList);
		this.logger.debug(`Chat context: ${chatStringWithSender.substring(0, 100)}...`);

		// AI
		this.logger.log('Calling AI service to refine question');
		const question: string = await this.AIService.getQuestionByChatContextString(queryText, chatStringWithSender);
		this.logger.log(`AI refined question: ${question}`);

		if (!question?.trim()) {
			throw new ServiceUnavailableException('Failed to process query with AI service');
		}

		this.logger.debug(`Refined question: ${question}`);

		// embedding 생성
		this.logger.log('Creating embedding for question');
		const embedding: number[] = await this.AIService.createEmbedding(question);
		this.logger.log(`Embedding created with ${embedding.length} dimensions`);

		if (!embedding || embedding.length === 0) {
			throw new ServiceUnavailableException('Failed to generate embedding');
		}

		// 유사문서 검색 & rerank
		const query: QdrantSearchParams = {
			organizationId: OrgID,
			denseVector: embedding,
			queryText: question,
		};

		this.logger.log('Performing hybrid search with Qdrant');
		const points: QdrantQueryPointEntity = await this.questionRepository.getDocsByHybridSearchAndOrgId(query);
		this.logger.log(`Hybrid search returned ${points.points?.length || 0} points`);

		return points.extractPayloadPairs;
	}
}


