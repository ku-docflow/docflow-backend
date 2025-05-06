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

