import {SearchBotReferenceDto} from "./dto/question.res.dto";

export interface QdrantFilter {
    must: Array<{
        key: string;
        match: {
            value: string;
        };
    }>;
}

export interface QdrantSearchParams {
    organizationId: number;
    denseVector: number[];
    queryText: string;
}

export class PointEntity {
    // @PrimaryColumn()
    /** @set{documentId}*/
    id: number;

    // @Column()
    version: number;

    // @Column('float')
    score: number;

    // @Column('json', { nullable: true })
    payload?: Record<string, unknown> | { [p: string]: unknown } | null;

    // @Column({ nullable: true })
    shard_key?: string | number | Record<string, unknown> | null;

    // @Column({ nullable: true })
    order_value?: number | Record<string, unknown> | null;

    constructor(partial: Partial<PointEntity>) {
        Object.assign(this, partial);
    }
}

export class QdrantQueryPointEntity {
    points: PointEntity[];

    constructor(points: PointEntity[]) {
        this.points = points;
    }

    get extractIds(): Array<number> {
        return this.points.map(point => point.id);
    }

    get extractPayloadPairs(): SearchBotReferenceDto[] {
        return this.points.map((point) => {
            const payload = point.payload || {};

            //Payload를 정의해야함.
            return Object.assign(new SearchBotReferenceDto(), {
                documentId: point.id,
                title: payload['title'] as string,
                summary: payload['summary'] as string,
                createdBy: payload['createdBy'] as string,
                createdAt: payload['createdAt'] as string,
                category: payload['category'] as 'DEV_DOC' | 'MEETING_DOC' | undefined,
            });
        });
    }
}
