import {BadGatewayException,} from '@nestjs/common';
import Retry from "../../../common/decorator/retry.decorator";
import OpenAI from "openai";
import {AIApi} from "./AI.api";

export class AIApiImpl implements AIApi {
    @Retry(3, 5000)
    async chatWithSystemAndUserPrompt(system: string, user: string) {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API Key 가져오기
        });

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: system,
                },
                {
                    role: 'user',
                    content: user,
                },
            ],
        });

        const result = completion.choices[0].message?.content;

        if (!result) {
            throw new BadGatewayException('Open AI API Null Exception');
        }

        return result;
    }


    @Retry(3, 10000)
    async createEmbedding(text: string) {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY, // 환경 변수에서 API Key 가져오기
        });

        const embedding = await openai.embeddings.create({
            model: 'text-embedding-3-large',
            dimensions: 1024,
            input: text,
        });
        return embedding.data[0].embedding;
    }
}
