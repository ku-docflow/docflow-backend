export interface QdrantFilter {
    must: Array<{
        key: string;
        match: {
            value: string;
        };
    }>;
}

export interface QdrantSearchParams {
    orgId: number;
    denseVector: number[];
    queryText: string;
}

export interface QdrantQueryPoint {
    points: {
        id: string | number;
        version: number;
        score: number;
        payload?: Record<string, unknown> | { [p: string]: unknown } | null | undefined;
        vector?: Record<string, unknown> | number[] | number[][] | {
            [p: string]: number[] | number[][] | { indices: number[]; values: number[] } | undefined
        } | null | undefined;
        shard_key?: string | number | Record<string, unknown> | null | undefined;
        order_value?: number | Record<string, unknown> | null | undefined
    }[]
}
