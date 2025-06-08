// src/modules/qdrant/qdrant.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { QdrantClient } from '@qdrant/js-client-rest';
import { QdrantSearchParams } from './qdrant.interface';
import { PointEntity, QdrantQueryPointEntity } from '../question/points.entity';
import { plainToInstance } from 'class-transformer';
import { calculateSingleBM25 } from '../util/bm25';


export const collectionName = 'documents';


@Injectable()
export class QdrantService implements OnModuleInit {
	constructor(private readonly client: QdrantClient) {
	}

	async onModuleInit() {
		console.log('Qdrant DB CONNECTED!!!!!');
		if (process.env.NODE_ENV === 'production') return;

		console.log('Qdrant Develop Env : Create Collection if not exist');
		const collections = await this.client.getCollections();
		const exists = collections.collections.some(c => c.name === collectionName);

		if (!exists) {
			await this.client.createCollection(collectionName, {
				vectors: { size: 1024, distance: 'Dot' },
			});
			console.log(`[Qdrant] Created collection: ${collectionName}`);
		} else {
			console.log(`[Qdrant] Collection already exists: ${collectionName}`);
		}
		// 인덱싱 해야 Sparse Search 가능 ( production에서는 한번만 )
		await this.client.createPayloadIndex('documents', {
			field_name: 'keywords',
			field_schema: 'text',
		});
	}

	async getHybridSearch(params: QdrantSearchParams): Promise<QdrantQueryPointEntity> {
		// 1단계: Dense vector로 후보군 대량 추출 (50개)
		const orgFilter = {
			must: [
				...(params.organizationId
					? [
						{
							key: 'organizationId',
							match: { value: params.organizationId },
						},
					]
					: []),
			],
		};

		// Dense vector search로 후보 추출
		const candidates = await this.client.search('documents', {
			vector: params.denseVector,
			filter: orgFilter,
			limit: 10,  // 많은 후보 추출
			with_payload: true,
		});

		console.log(`Dense search 후보: ${candidates.length}개`);

		// 2단계: 키워드 + BM25 기반 Re-ranking
		const extractedKeywords = this.extractKeywordsFromQuery(params.queryText);
		console.log('추출된 키워드:', extractedKeywords);

		const rerankedPoints = candidates.map(point => {
			const vectorScore = point.score;
			const payload = point.payload || {};

			// Type-safe payload 추출
			const documentKeywords = payload['keywords'] as string[] || [];
			const documentSummary = payload['summary'] as string || payload['title'] as string || '';
			const documentTitle = payload['title'] as string || '';
			const documentCreatedBy = payload['createdBy'] as string || '';
			const documentCreatedAt = payload['createdAt'] as string || '';
			const documentCategory = payload['category'] as 'DEV_DOC' | 'MEETING_DOC' | undefined;

			// 키워드 매칭 점수 계산 (정확한 매칭 + 부분 매칭)
			const exactMatches = extractedKeywords.filter(kw =>
				documentKeywords.includes(kw),
			).length;
			
			// 부분 매칭 점수 (대소문자 무시하고 포함 관계 확인)
			const partialMatches = extractedKeywords.filter(queryKw =>
				documentKeywords.some(docKw => 
					docKw.toLowerCase().includes(queryKw.toLowerCase()) ||
					queryKw.toLowerCase().includes(docKw.toLowerCase())
				)
			).length - exactMatches; // 정확 매칭 제외
			
			const keywordScore = (exactMatches * 0.4) + (partialMatches * 0.2);

			// BM25 점수 계산 (문서 요약 vs 쿼리)
			const bm25Score = calculateSingleBM25(params.queryText, documentSummary) * 0.15;

			// keywords를 텍스트로 변환해서 BM25 추가 계산
			const keywordsText = documentKeywords.join(' ');
			const keywordsBM25 = calculateSingleBM25(params.queryText, keywordsText) * 0.1;

			// 최종 점수 = vector점수 + 키워드매칭 + 요약BM25 + 키워드BM25
			const finalScore = vectorScore + keywordScore + bm25Score + keywordsBM25;

			console.log(`Doc ${point.id}: vector=${vectorScore.toFixed(3)}, exactKw=${exactMatches}, partialKw=${partialMatches}, kwScore=${keywordScore.toFixed(3)}, summaryBM25=${bm25Score.toFixed(3)}, kwBM25=${keywordsBM25.toFixed(3)}, final=${finalScore.toFixed(3)}`);

			return {
				...point,
				score: finalScore,
			};
		})
			.sort((a, b) => b.score - a.score)  // 최종 점수로 정렬
			.slice(0, 3);  // 상위 3개만 선택

		const points: PointEntity[] = plainToInstance(PointEntity, rerankedPoints);
		return new QdrantQueryPointEntity(points);
	}

	private extractKeywordsFromQuery(queryText: string): string[] {
		if (!queryText) return [];

		// 간단한 키워드 추출 (LLM 사용 전 임시)
		return queryText
			.toLowerCase()
			.split(/\s+/)
			.filter(word => word.length > 2)
			.filter(word => !this.isStopWord(word));
	}

	private isStopWord(word: string): boolean {
		const stopWords = ['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'for', 'with', 'in', 'of', 'to'];
		return stopWords.includes(word);
	}

	// 특정 상황에서만 쓸 기능은 그대로 내부에서 접근
	get rawClient() {
		return this.client;
	}
}