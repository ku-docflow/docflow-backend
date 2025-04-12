import {AIApi} from "./api/AI.api";
import {QuestionPrompt} from "./prompt/question.prompt";

export class AIService {
    constructor(private readonly api: AIApi) {
    }

    async chatWithSystemAndUserPrompt(system: string, user: string): Promise<string> {
        return this.api.chatWithSystemAndUserPrompt(system, user);
    }

    async createEmbedding(text: string): Promise<number[]> {
        return this.api.createEmbedding(text);
    }

    async getQuestionByChatContextString(context: string) {
        return this.chatWithSystemAndUserPrompt(QuestionPrompt.systemPrompt(), QuestionPrompt.userPrompt(context))
    }
}
