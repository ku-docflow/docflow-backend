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
    const engine = bm25();
    engine.defineConfig({ fldWeights: { text: 1 } });
    engine.definePrepTasks([
        nlp.string.lowerCase,
        nlp.string.tokenize0,
        nlp.tokens.stem
    ]);

    // 단일 문서 추가
    engine.addDoc({ text: document }, 0);
    engine.consolidate();

    // 검색 수행
    const results = engine.search(query);
    
    // 결과가 있으면 점수 반환, 없으면 0
    return results.length > 0 ? results[0][1] : 0;
}