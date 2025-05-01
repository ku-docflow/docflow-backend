// src/modules/qdrant/qdrant.service.ts
import {Injectable, OnModuleInit} from '@nestjs/common';
import {QdrantClient} from '@qdrant/js-client-rest';
import {QdrantSearchParams} from "./qdrant.interface";
import {PointEntity, QdrantQueryPointEntity} from "../question/points.entity";
import {plainToInstance} from "class-transformer";


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
        // 인덱싱 해야 Sparse Search 가능 ( production에서는 한번만 )
        await this.client.createPayloadIndex('documents', {
            field_name: 'keywords',
            field_schema: 'text',
        });
    }

    async getHybridSearch(params: QdrantSearchParams): Promise<QdrantQueryPointEntity> {
        const orgFilter = {
            must: [
                {
                    key: "organizationId",
                    match: {value: params.organizationId},
                },
            ],
        }
        const raw = await this.client.query("documents", {
            prefetch: [
                {
                    query: params.denseVector,
                    using: "dense",
                    filter: orgFilter,
                    limit: 20,
                },
                {
                    query: params.queryText, // 예: "recommendation system"
                    using: "sparse",
                    filter: orgFilter,
                    limit: 20,
                },
            ],
            query: {
                fusion: "dbsf", // 또는 "rrf"
            },
            limit: 3,
            with_payload: true,
        });
        const points = plainToInstance(PointEntity, raw.points);
        return new QdrantQueryPointEntity(points);

    }

    // 특정 상황에서만 쓸 기능은 그대로 내부에서 접근
    get rawClient() {
        return this.client;
    }
}