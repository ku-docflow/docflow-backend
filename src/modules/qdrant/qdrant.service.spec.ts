import { Test, TestingModule } from '@nestjs/testing';
import { QdrantService } from './qdrant.service';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantSearchParams } from './qdrant.interface';
import { PointEntity, QdrantQueryPointEntity } from '../question/points.entity';

// BM25 함수 모킹
jest.mock('../util/bm25', () => ({
	calculateSingleBM25: jest.fn().mockReturnValue(0.1),
}));

const mockQdrantClient = () => ({
	getCollections: jest.fn(),
	createCollection: jest.fn(),
	createPayloadIndex: jest.fn(),
	search: jest.fn(),
});

describe('QdrantService', () => {
	let service: QdrantService;
	let client: jest.Mocked<QdrantClient>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				QdrantService,
				{ provide: QdrantClient, useFactory: mockQdrantClient },
			],
		}).compile();

		service = module.get(QdrantService);
		client = module.get(QdrantClient);

		// NODE_ENV를 test로 설정하여 onModuleInit에서 production 체크 우회
		process.env.NODE_ENV = 'test';
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('onModuleInit', () => {
		it('should create collection if it does not exist', async () => {
			client.getCollections.mockResolvedValue({
				collections: [],
			});

			await service.onModuleInit();

			expect(client.createCollection).toHaveBeenCalledWith('documents', {
				vectors: { size: 1024, distance: 'Dot' },
			});
			expect(client.createPayloadIndex).toHaveBeenCalledWith('documents', {
				field_name: 'keywords',
				field_schema: 'text',
			});
		});

		it('should not create collection if it already exists', async () => {
			client.getCollections.mockResolvedValue({
				collections: [{ name: 'documents' }],
			});

			await service.onModuleInit();

			expect(client.createCollection).not.toHaveBeenCalled();
			expect(client.createPayloadIndex).toHaveBeenCalled();
		});

		it('should skip initialization in production', async () => {
			process.env.NODE_ENV = 'production';

			await service.onModuleInit();

			expect(client.getCollections).not.toHaveBeenCalled();
			expect(client.createCollection).not.toHaveBeenCalled();
		});
	});

	describe('getHybridSearch', () => {
		const mockSearchParams: QdrantSearchParams = {
			organizationId: 1,
			denseVector: [0.1, 0.2, 0.3],
			queryText: 'test query',
		};

		const mockSearchResults = [
			{
				id: 1,
				version: 1,
				score: 0.8,
				payload: {
					title: 'Test Document',
					summary: 'This is a test document summary',
					keywords: ['test', 'document'],
					createdBy: 'user1',
					createdAt: '2023-01-01',
					category: 'DEV_DOC',
				},
			},
			{
				id: 2,
				version: 1,
				score: 0.7,
				payload: {
					title: 'Another Document',
					summary: 'Another test document',
					keywords: ['another', 'document'],
					createdBy: 'user2',
					createdAt: '2023-01-02',
					category: 'MEETING_DOC',
				},
			},
		];

		beforeEach(() => {
			client.search.mockResolvedValue(mockSearchResults);
		});

		it('should perform hybrid search with organization filter', async () => {
			const result = await service.getHybridSearch(mockSearchParams);

			expect(client.search).toHaveBeenCalledWith('documents', {
				vector: mockSearchParams.denseVector,
				filter: {
					must: [
						{
							key: 'organizationId',
							match: { value: mockSearchParams.organizationId },
						},
					],
				},
				limit: 10,
				with_payload: true,
			});

			expect(result).toBeInstanceOf(QdrantQueryPointEntity);
			expect(result.points).toHaveLength(2);
		});

		it('should perform hybrid search without organization filter when organizationId is null', async () => {
			const paramsWithoutOrg = { ...mockSearchParams, organizationId: null };
			
			await service.getHybridSearch(paramsWithoutOrg);

			expect(client.search).toHaveBeenCalledWith('documents', {
				vector: mockSearchParams.denseVector,
				filter: {
					must: [],
				},
				limit: 10,
				with_payload: true,
			});
		});

		it('should rerank results based on keyword matching and BM25 scores', async () => {
			const paramsWithKeywords = {
				...mockSearchParams,
				queryText: 'test document query',
			};

			const result = await service.getHybridSearch(paramsWithKeywords);

			// 첫 번째 문서가 'test'와 'document' 키워드를 모두 가지고 있어서 더 높은 점수를 받을 것
			expect(result.points[0].score).toBeGreaterThan(result.points[1].score);
		});

		it('should handle empty search results', async () => {
			client.search.mockResolvedValue([]);

			const result = await service.getHybridSearch(mockSearchParams);

			expect(result.points).toHaveLength(0);
		});

		it('should handle documents without payload', async () => {
			client.search.mockResolvedValue([
				{
					id: 1,
					version: 1,
					score: 0.8,
					payload: null,
				},
			]);

			const result = await service.getHybridSearch(mockSearchParams);

			expect(result.points).toHaveLength(1);
			expect(result.points[0].payload).toBeNull();
		});
	});

	describe('extractKeywordsFromQuery', () => {
		it('should extract keywords from query text', () => {
			const keywords = (service as any).extractKeywordsFromQuery('test document with some keywords');
			
			expect(keywords).toContain('test');
			expect(keywords).toContain('document');
			expect(keywords).toContain('keywords');
			expect(keywords).not.toContain('with'); // stop word
			expect(keywords).toContain('some'); // 'some'은 stop word가 아님
		});

		it('should return empty array for empty query', () => {
			const keywords = (service as any).extractKeywordsFromQuery('');
			expect(keywords).toEqual([]);
		});

		it('should filter out stop words', () => {
			const keywords = (service as any).extractKeywordsFromQuery('the quick brown fox');
			expect(keywords).not.toContain('the');
			expect(keywords).toContain('quick');
			expect(keywords).toContain('brown');
		});
	});

	describe('isStopWord', () => {
		it('should identify stop words correctly', () => {
			expect((service as any).isStopWord('the')).toBe(true);
			expect((service as any).isStopWord('and')).toBe(true);
			expect((service as any).isStopWord('test')).toBe(false);
			expect((service as any).isStopWord('document')).toBe(false);
		});
	});

	describe('rawClient', () => {
		it('should return the raw Qdrant client', () => {
			expect(service.rawClient).toBe(client);
		});
	});
});