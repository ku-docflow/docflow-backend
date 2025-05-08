import {AIApi} from "./api/AI.api";
import {QuestionPrompt} from "./prompt/question.prompt";
import {Inject, Injectable} from "@nestjs/common";

@Injectable()
export class AIService {
    constructor(
        @Inject('AIApi')
        private readonly api: AIApi) {
    }

    async chatWithSystemAndUserPrompt(system: string, user: string): Promise<string> {
        return this.api.chatWithSystemAndUserPrompt(system, user);
    }

    async createEmbedding(text: string): Promise<number[]> {
        return this.api.createEmbedding(text);
    }

    async getQuestionByChatContextString(queryText:string, context: string) {
        return this.chatWithSystemAndUserPrompt(QuestionPrompt.systemPrompt(), QuestionPrompt.userPrompt(queryText, context))
    }
}
