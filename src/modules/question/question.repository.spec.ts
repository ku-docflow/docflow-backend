import { Test, TestingModule } from '@nestjs/testing';
import { QuestionRepository } from './question.repository';
import { QdrantService } from '../qdrant/qdrant.service';
import { QdrantSearchParams } from '../qdrant/qdrant.interface';
import { QdrantQueryPointEntity, PointEntity } from './points.entity';

const mockQdrantService = () => ({
	getHybridSearch: jest.fn(),
});

describe('QuestionRepository', () => {
	let repository: QuestionRepository;
	let qdrantService: jest.Mocked<QdrantService>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				QuestionRepository,
				{ provide: QdrantService, useFactory: mockQdrantService },
			],
		}).compile();

		repository = module.get(QuestionRepository);
		qdrantService = module.get(QdrantService);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getDocsByHybridSearchAndOrgId', () => {
		const mockSearchParams: QdrantSearchParams = {
			organizationId: 1,
			denseVector: [0.1, 0.2, 0.3, 0.4],
			queryText: 'test query for hybrid search',
		};

		const mockPointEntities: PointEntity[] = [
			{
				id: 1,
				version: 1,
				score: 0.85,
				payload: {
					title: 'Test Document 1',
					summary: 'This is a test document summary',
					createdBy: 'user1',
					createdAt: '2023-01-01',
					category: 'DEV_DOC',
					keywords: ['test', 'document', 'development'],
				},
			},
			{
				id: 2,
				version: 1,
				score: 0.72,
				payload: {
					title: 'Meeting Notes',
					summary: 'Weekly team meeting notes',
					createdBy: 'user2',
					createdAt: '2023-01-02',
					category: 'MEETING_DOC',
					keywords: ['meeting', 'notes', 'team'],
				},
			},
		];

		const mockQdrantQueryResult = new QdrantQueryPointEntity(mockPointEntities);

		it('should call QdrantService and return hybrid search results', async () => {
			qdrantService.getHybridSearch.mockResolvedValue(mockQdrantQueryResult);

			const result = await repository.getDocsByHybridSearchAndOrgId(mockSearchParams);

			expect(qdrantService.getHybridSearch).toHaveBeenCalledWith(mockSearchParams);
			expect(result).toEqual(mockQdrantQueryResult);
			expect(result.points).toHaveLength(2);
			expect(result.points[0].id).toBe(1);
			expect(result.points[1].id).toBe(2);
		});

		it('should handle empty search results', async () => {
			const emptyResult = new QdrantQueryPointEntity([]);
			qdrantService.getHybridSearch.mockResolvedValue(emptyResult);

			const result = await repository.getDocsByHybridSearchAndOrgId(mockSearchParams);

			expect(qdrantService.getHybridSearch).toHaveBeenCalledWith(mockSearchParams);
			expect(result.points).toHaveLength(0);
		});

		it('should handle search parameters without organization ID', async () => {
			const paramsWithoutOrgId: QdrantSearchParams = {
				organizationId: null,
				denseVector: [0.1, 0.2, 0.3],
				queryText: 'test query',
			};

			qdrantService.getHybridSearch.mockResolvedValue(mockQdrantQueryResult);

			const result = await repository.getDocsByHybridSearchAndOrgId(paramsWithoutOrgId);

			expect(qdrantService.getHybridSearch).toHaveBeenCalledWith(paramsWithoutOrgId);
			expect(result).toEqual(mockQdrantQueryResult);
		});

		it('should propagate QdrantService errors', async () => {
			const error = new Error('Qdrant connection failed');
			qdrantService.getHybridSearch.mockRejectedValue(error);

			await expect(repository.getDocsByHybridSearchAndOrgId(mockSearchParams))
				.rejects.toThrow('Qdrant connection failed');

			expect(qdrantService.getHybridSearch).toHaveBeenCalledWith(mockSearchParams);
		});

		it('should handle malformed search parameters', async () => {
			const malformedParams = {
				organizationId: 'invalid',
				denseVector: null,
				queryText: '',
			} as any;

			const error = new Error('Invalid search parameters');
			qdrantService.getHybridSearch.mockRejectedValue(error);

			await expect(repository.getDocsByHybridSearchAndOrgId(malformedParams))
				.rejects.toThrow('Invalid search parameters');
		});

		it('should handle large vector dimensions', async () => {
			const largeVectorParams: QdrantSearchParams = {
				organizationId: 1,
				denseVector: new Array(1024).fill(0.1),
				queryText: 'test with large vector',
			};

			qdrantService.getHybridSearch.mockResolvedValue(mockQdrantQueryResult);

			const result = await repository.getDocsByHybridSearchAndOrgId(largeVectorParams);

			expect(qdrantService.getHybridSearch).toHaveBeenCalledWith(largeVectorParams);
			expect(result).toEqual(mockQdrantQueryResult);
		});
	});

	describe('Integration', () => {
		it('should be defined', () => {
			expect(repository).toBeDefined();
		});

		it('should have QdrantService dependency injected', () => {
			expect(qdrantService).toBeDefined();
		});
	});
});