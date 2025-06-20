import bm25 from 'wink-bm25-text-search';
import nlp from 'wink-nlp-utils';

export function computeBM25Scores(query: string, documents: string[]): number[] {
    const engine = bm25();
    engine.defineConfig({ fldWeights: { text: 1 } });
    engine.definePrepTasks([
        nlp.string.lowerCase,
        nlp.string.tokenize0,
        nlp.tokens.stem
    ]);

    documents.forEach((text, i) => {
        engine.addDoc({ text }, i);
    });
    engine.consolidate();

    const bm25Results = engine.search(query);
    const scores: number[] = Array(documents.length).fill(0);

    for (const [idx, score] of bm25Results) {
        scores[idx] = score;
    }

    return scores;
}

// 개별 문서와 쿼리 간의 BM25 점수 계산
export function calculateSingleBM25(query: string, document: string): number {
    // 빈 문서이거나 빈 쿼리인 경우 0 반환
    if (!query?.trim() || !document?.trim()) {
        return 0;
    }

    try {
        const engine = bm25();
        engine.defineConfig({ fldWeights: { text: 1 } });
        engine.definePrepTasks([
            nlp.string.lowerCase,
            nlp.string.tokenize0,
            nlp.tokens.stem
        ]);

        // BM25는 최소 2개 이상의 문서가 필요하므로 더미 문서 추가
        engine.addDoc({ text: document }, 0);
        engine.addDoc({ text: 'dummy document for bm25 calculation' }, 1);
        engine.consolidate();

        // 검색 수행
        const results = engine.search(query);
        
        // 첫 번째 문서(우리가 원하는 문서)의 점수만 반환
        for (const [idx, score] of results) {
            if (idx === 0) {
                return score;
            }
        }
        
        return 0;
    } catch (error) {
        console.error('BM25 calculation error:', error.message);
        return 0;
    }
}