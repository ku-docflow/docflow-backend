import { Test, TestingModule } from '@nestjs/testing';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { SemanticSearchRequestDto } from './dto/question.req.dto';
import { SearchBotReferenceDto, SearchBotResponseDto } from './dto/question.res.dto';

const mockQuestionService = () => ({
	getSearch: jest.fn(),
	getRagSearch: jest.fn(),
});

describe('QuestionController', () => {
	let controller: QuestionController;
	let questionService: jest.Mocked<QuestionService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [QuestionController],
			providers: [
				{ provide: QuestionService, useFactory: mockQuestionService },
			],
		}).compile();

		controller = module.get(QuestionController);
		questionService = module.get(QuestionService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getQuestionQuery', () => {
		const mockQuery: SemanticSearchRequestDto = {
			query: 'test question',
			chatRoomId: 1,
		};

		const mockSearchResults: SearchBotReferenceDto[] = [
			{
				documentId: 1,
				title: 'Test Document',
				summary: 'Test summary',
				createdBy: 'user1',
				createdAt: new Date('2023-01-01'),
				category: 'DEV_DOC',
				keywords: ['test', 'document'],
			},
			{
				documentId: 2,
				title: 'Another Document',
				summary: 'Another summary',
				createdBy: 'user2',
				createdAt: new Date('2023-01-02'),
				category: 'MEETING_DOC',
				keywords: ['meeting', 'notes'],
			},
		];

		it('should return search results', async () => {
			questionService.getSearch.mockResolvedValue(mockSearchResults);

			const result = await controller.getQuestionQuery(mockQuery);

			expect(questionService.getSearch).toHaveBeenCalledWith(mockQuery);
			expect(result).toEqual(mockSearchResults);
		});

		it('should handle empty search results', async () => {
			questionService.getSearch.mockResolvedValue([]);

			const result = await controller.getQuestionQuery(mockQuery);

			expect(questionService.getSearch).toHaveBeenCalledWith(mockQuery);
			expect(result).toEqual([]);
		});

		it('should handle service errors', async () => {
			const error = new Error('Search service error');
			questionService.getSearch.mockRejectedValue(error);

			await expect(controller.getQuestionQuery(mockQuery)).rejects.toThrow('Search service error');
		});
	});

	describe('getRagSearchBot', () => {
		const mockQuery: SemanticSearchRequestDto = {
			query: 'test question for RAG',
			chatRoomId: 1,
		};

		const mockRagResponse: SearchBotResponseDto = {
			ragResponse: 'AI generated response based on context',
			references: [
				{
					documentId: 1,
					title: 'Test Document',
					summary: 'Test summary',
					createdBy: 'user1',
					createdAt: new Date('2023-01-01'),
					category: 'DEV_DOC',
					keywords: ['test', 'document'],
				},
			],
		};

		it('should return RAG search results', async () => {
			questionService.getRagSearch.mockResolvedValue(mockRagResponse);

			const result = await controller.getRagSearchBot(mockQuery);

			expect(questionService.getRagSearch).toHaveBeenCalledWith(mockQuery);
			expect(result).toEqual(mockRagResponse);
		});

		it('should handle RAG search with empty references', async () => {
			const emptyRagResponse: SearchBotResponseDto = {
				ragResponse: 'No relevant documents found',
				references: [],
			};
			questionService.getRagSearch.mockResolvedValue(emptyRagResponse);

			const result = await controller.getRagSearchBot(mockQuery);

			expect(questionService.getRagSearch).toHaveBeenCalledWith(mockQuery);
			expect(result).toEqual(emptyRagResponse);
		});

		it('should handle RAG service errors', async () => {
			const error = new Error('RAG service error');
			questionService.getRagSearch.mockRejectedValue(error);

			await expect(controller.getRagSearchBot(mockQuery)).rejects.toThrow('RAG service error');
		});

		it('should handle malformed query', async () => {
			const malformedQuery = {
				query: '',
				chatRoomId: null,
			} as any;

			questionService.getRagSearch.mockRejectedValue(new Error('Invalid query'));

			await expect(controller.getRagSearchBot(malformedQuery)).rejects.toThrow('Invalid query');
		});
	});

	describe('Integration', () => {
		it('should be defined', () => {
			expect(controller).toBeDefined();
		});

		it('should have all required methods', () => {
			expect(controller.getQuestionQuery).toBeDefined();
			expect(controller.getRagSearchBot).toBeDefined();
		});
	});
});