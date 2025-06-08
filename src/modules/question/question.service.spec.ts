import { Test, TestingModule } from '@nestjs/testing';
import { 
	BadRequestException, 
	NotFoundException, 
	ForbiddenException, 
	ServiceUnavailableException 
} from '@nestjs/common';
import { QuestionService } from './question.service';
import { ChatService } from '../chat/chat.service';
import { AIService } from '../AI/AI.service';
import { QuestionRepository } from './question.repository';
import { DocumentService } from '../document/document.service';
import { ChatroomService } from '../chatroom/chatroom.service';
import { SemanticSearchRequestDto } from './dto/question.req.dto';
import { SearchBotReferenceDto, SearchBotResponseDto } from './dto/question.res.dto';
import { Message } from '../chatroom/message.entity';
import { Document } from '../document/document.entity';
import { QdrantQueryPointEntity, PointEntity } from './points.entity';

// Python API 모킹
jest.mock('../py/api', () => {
	return {
		SearchBotApi: jest.fn().mockImplementation(() => ({
			searchDocument: jest.fn().mockResolvedValue({
				data: {
					ragResponse: 'AI generated response based on documents'
				}
			})
		}))
	};
});

const mockChatService = () => ({
	getMessagesByRoomIdAndMinutes: jest.fn(),
});

const mockAIService = () => ({
	getQuestionByChatContextString: jest.fn(),
	createEmbedding: jest.fn(),
});

const mockQuestionRepository = () => ({
	getDocsByHybridSearchAndOrgId: jest.fn(),
});

const mockDocumentService = () => ({
	getDocByIds: jest.fn(),
});

const mockChatroomService = () => ({
	getOrgIdByChatroomId: jest.fn(),
});

describe('QuestionService', () => {
	let service: QuestionService;
	let chatService: jest.Mocked<ChatService>;
	let aiService: jest.Mocked<AIService>;
	let questionRepository: jest.Mocked<QuestionRepository>;
	let documentService: jest.Mocked<DocumentService>;
	let chatroomService: jest.Mocked<ChatroomService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				QuestionService,
				{ provide: ChatService, useFactory: mockChatService },
				{ provide: AIService, useFactory: mockAIService },
				{ provide: QuestionRepository, useFactory: mockQuestionRepository },
				{ provide: DocumentService, useFactory: mockDocumentService },
				{ provide: ChatroomService, useFactory: mockChatroomService },
			],
		}).compile();

		service = module.get(QuestionService);
		chatService = module.get(ChatService);
		aiService = module.get(AIService);
		questionRepository = module.get(QuestionRepository);
		documentService = module.get(DocumentService);
		chatroomService = module.get(ChatroomService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getRagSearch', () => {
		const mockQuery: SemanticSearchRequestDto = {
			query: 'test question',
			chatRoomId: 1,
		};

		const mockSearchBotReferenceDto: SearchBotReferenceDto[] = [
			{
				documentId: 1,
				title: 'Test Document',
				summary: 'Test summary',
				createdBy: 'user1',
				createdAt: new Date('2023-01-01'),
				category: 'DEV_DOC',
				keywords: ['test', 'document'],
			},
		];

		const mockDocuments: Document[] = [
			{
				id: 1,
				text: 'Test Document Title\nThis is the content of the test document',
				created_at: new Date('2023-01-01'),
				topic: { id: 1, name: 'test-topic' } as any,
				topic_id: 1,
			} as Document,
		];

		beforeEach(() => {
			// queryMessageContext를 모킹하기 위해 private 메서드를 spy
			jest.spyOn(service as any, 'queryMessageContext').mockResolvedValue(mockSearchBotReferenceDto);
			documentService.getDocByIds.mockResolvedValue(mockDocuments);
		});

		it('should perform RAG search and return response with AI generated content', async () => {
			const result = await service.getRagSearch(mockQuery);

			expect(result).toEqual({
				ragResponse: 'AI generated response based on documents',
				references: mockSearchBotReferenceDto,
			});

			expect(service['queryMessageContext']).toHaveBeenCalledWith(
				mockQuery.chatRoomId,
				mockQuery.query
			);
			expect(documentService.getDocByIds).toHaveBeenCalledWith([1]);
		});

		it('should handle empty document references', async () => {
			jest.spyOn(service as any, 'queryMessageContext').mockResolvedValue([]);

			const result = await service.getRagSearch(mockQuery);

			expect(result.references).toEqual([]);
			expect(result.ragResponse).toBe('No relevant documents found for your query.');
			expect(documentService.getDocByIds).not.toHaveBeenCalled();
		});

		it('should throw BadRequestException for empty query', async () => {
			const invalidQuery = { ...mockQuery, query: '' };
			
			await expect(service.getRagSearch(invalidQuery)).rejects.toThrow(
				new BadRequestException('Query is required and cannot be empty')
			);
		});

		it('should throw BadRequestException for invalid chatroom ID', async () => {
			const invalidQuery = { ...mockQuery, chatRoomId: 0 };
			
			await expect(service.getRagSearch(invalidQuery)).rejects.toThrow(
				new BadRequestException('Valid chatroom ID is required')
			);
		});

		it('should throw NotFoundException when documents not found', async () => {
			jest.spyOn(service as any, 'queryMessageContext').mockResolvedValue(mockSearchBotReferenceDto);
			documentService.getDocByIds.mockResolvedValue([]);

			await expect(service.getRagSearch(mockQuery)).rejects.toThrow(
				new NotFoundException('Referenced documents not found')
			);
		});

		it('should throw ServiceUnavailableException when Python API fails', async () => {
			jest.spyOn(service as any, 'queryMessageContext').mockResolvedValue(mockSearchBotReferenceDto);
			documentService.getDocByIds.mockResolvedValue(mockDocuments);

			// Python API에서 빈 응답 반환
			const { SearchBotApi } = require('../py/api');
			SearchBotApi.mockImplementation(() => ({
				searchDocument: jest.fn().mockResolvedValue({
					data: null
				})
			}));

			await expect(service.getRagSearch(mockQuery)).rejects.toThrow(
				new ServiceUnavailableException('Failed to generate AI response')
			);
		});
	});

	describe('getSearch', () => {
		const mockQuery: SemanticSearchRequestDto = {
			query: 'test question',
			chatRoomId: 1,
		};

		const mockSearchBotReferenceDto: SearchBotReferenceDto[] = [
			{
				documentId: 1,
				title: 'Test Document',
				summary: 'Test summary',
				createdBy: 'user1',
				createdAt: new Date('2023-01-01'),
				category: 'DEV_DOC',
				keywords: ['test', 'document'],
			},
		];

		it('should perform semantic search and return references', async () => {
			jest.spyOn(service as any, 'queryMessageContext').mockResolvedValue(mockSearchBotReferenceDto);

			const result = await service.getSearch(mockQuery);

			expect(result).toEqual(mockSearchBotReferenceDto);
			expect(service['queryMessageContext']).toHaveBeenCalledWith(
				mockQuery.chatRoomId,
				mockQuery.query
			);
		});

		it('should throw BadRequestException for empty query in getSearch', async () => {
			const invalidQuery = { ...mockQuery, query: '' };
			
			await expect(service.getSearch(invalidQuery)).rejects.toThrow(
				new BadRequestException('Query is required and cannot be empty')
			);
		});

		it('should throw BadRequestException for invalid chatroom ID in getSearch', async () => {
			const invalidQuery = { ...mockQuery, chatRoomId: -1 };
			
			await expect(service.getSearch(invalidQuery)).rejects.toThrow(
				new BadRequestException('Valid chatroom ID is required')
			);
		});
	});

	describe('queryMessageContext', () => {
		const mockMessages: Message[] = [
			{
				id: 1,
				text: 'Hello, I need help with testing',
				chatroom_id: 1,
				timestamp: new Date(),
				type: 'default' as any,
				sender_id: '1',
				sender: { id: '1', first_name: 'John', last_name: 'Doe' } as any,
				mentions: [],
				chatroom: { id: 1 } as any,
			} as Message,
		];

		const mockPointEntity: PointEntity = {
			id: 1,
			version: 1,
			score: 0.8,
			payload: {
				title: 'Test Document',
				summary: 'Test summary',
				createdBy: 'user1',
				createdAt: '2023-01-01',
				category: 'DEV_DOC',
				keywords: ['test', 'document'],
			},
		} as PointEntity;

		const mockQdrantQueryPointEntity = new QdrantQueryPointEntity([mockPointEntity]);

		beforeEach(() => {
			chatService.getMessagesByRoomIdAndMinutes.mockResolvedValue(mockMessages);
			chatroomService.getOrgIdByChatroomId.mockResolvedValue(1);
			aiService.getQuestionByChatContextString.mockResolvedValue('refined test question');
			aiService.createEmbedding.mockResolvedValue([0.1, 0.2, 0.3]);
			questionRepository.getDocsByHybridSearchAndOrgId.mockResolvedValue(mockQdrantQueryPointEntity);
			
			// Message.formatMessagesWithLabels static method 모킹
			jest.spyOn(Message, 'formatMessagesWithLabels').mockReturnValue('John Doe: Hello, I need help with testing');
		});

		it('should process chat context and return search results', async () => {
			const result = await (service as any).queryMessageContext(1, 'test question');

			expect(chatService.getMessagesByRoomIdAndMinutes).toHaveBeenCalledWith(1, 30);
			expect(chatroomService.getOrgIdByChatroomId).toHaveBeenCalledWith(1);
			expect(Message.formatMessagesWithLabels).toHaveBeenCalledWith(mockMessages);
			expect(aiService.getQuestionByChatContextString).toHaveBeenCalledWith(
				'test question',
				'John Doe: Hello, I need help with testing'
			);
			expect(aiService.createEmbedding).toHaveBeenCalledWith('refined test question');
			expect(questionRepository.getDocsByHybridSearchAndOrgId).toHaveBeenCalledWith({
				organizationId: 1,
				denseVector: [0.1, 0.2, 0.3],
				queryText: 'refined test question',
			});

			expect(result).toEqual(mockQdrantQueryPointEntity.extractPayloadPairs);
		});

		it('should handle empty chat messages', async () => {
			chatService.getMessagesByRoomIdAndMinutes.mockResolvedValue([]);
			jest.spyOn(Message, 'formatMessagesWithLabels').mockReturnValue('');

			const result = await (service as any).queryMessageContext(1, 'test question');

			expect(Message.formatMessagesWithLabels).toHaveBeenCalledWith([]);
			expect(aiService.getQuestionByChatContextString).toHaveBeenCalledWith('test question', '');
		});

		it('should handle AI service errors gracefully', async () => {
			aiService.getQuestionByChatContextString.mockRejectedValue(new Error('AI service error'));

			await expect((service as any).queryMessageContext(1, 'test question')).rejects.toThrow('AI service error');
		});

		it('should handle embedding creation errors', async () => {
			aiService.createEmbedding.mockRejectedValue(new Error('Embedding creation failed'));

			await expect((service as any).queryMessageContext(1, 'test question')).rejects.toThrow('Embedding creation failed');
		});

		it('should throw ForbiddenException when organization not found', async () => {
			chatroomService.getOrgIdByChatroomId.mockResolvedValue(null);

			await expect((service as any).queryMessageContext(1, 'test question')).rejects.toThrow(
				new ForbiddenException('Chatroom not found or access denied')
			);
		});

		it('should throw ServiceUnavailableException when AI fails to process query', async () => {
			aiService.getQuestionByChatContextString.mockResolvedValue('');

			await expect((service as any).queryMessageContext(1, 'test question')).rejects.toThrow(
				new ServiceUnavailableException('Failed to process query with AI service')
			);
		});

		it('should throw ServiceUnavailableException when embedding fails', async () => {
			aiService.createEmbedding.mockResolvedValue([]);

			await expect((service as any).queryMessageContext(1, 'test question')).rejects.toThrow(
				new ServiceUnavailableException('Failed to generate embedding')
			);
		});
	});
});