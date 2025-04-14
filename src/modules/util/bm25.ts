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