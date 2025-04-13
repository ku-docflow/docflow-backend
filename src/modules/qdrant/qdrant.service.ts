// src/modules/qdrant/qdrant.service.ts
import {Injectable, OnModuleInit} from '@nestjs/common';
import {QdrantClient} from '@qdrant/js-client-rest';

interface QdrantFilter {
    must: Array<{
        key: string;
        match: {
            value: string;
        };
    }>;
}

export interface QdrantSearchParams {
    orgId: number;
    points: number[];
    limit?: number;
}

export const collectionName = 'documents';


@Injectable()
export class QdrantService implements OnModuleInit {
    constructor(private readonly client: QdrantClient) {
    }

    async onModuleInit() {
        console.log('Qdrant DB CONNECTED!!!!!');
        if (process.env.NODE_ENV === 'production') return;

        console.log('Qdrant Develop Env : Create Collection if not exist')
        const collections = await this.client.getCollections();
        const exists = collections.collections.some(c => c.name === collectionName);

        if (!exists) {
            await this.client.createCollection(collectionName, {
                vectors: {size: 1024, distance: 'Dot'},
            });
            console.log(`[Qdrant] Created collection: ${collectionName}`);
        } else {
            console.log(`[Qdrant] Collection already exists: ${collectionName}`);
        }
    }

    async get(params: QdrantSearchParams) {
        return this.client.query(collectionName, {
            query: params.points,
            limit: params.limit,
            filter: {
                must: [{
                    key: 'orgId',
                    match: {
                        value: params.orgId
                    }
                }]
            }
        });
    }

    // 특정 상황에서만 쓸 기능은 그대로 내부에서 접근
    get rawClient() {
        return this.client;
    }
}