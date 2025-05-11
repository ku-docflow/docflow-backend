import {Body, Controller, Post} from '@nestjs/common';
import {GenBotService} from "./gen-bot.service";
import {GenBotRequestDto} from "./dto/gen-bot.dto";

// @UseGuards(FirebaseAuthGuard)
@Controller('gen-bot')
export class GenBotController {
    constructor(private readonly genBotService: GenBotService) {
    }


    @Post()
    async createDocument(
        @Body() query: GenBotRequestDto,
    ) {
        console.log(query);
        const mock = {
            documentId: 131231,
            organizationId: 123,
            createdAt: new Date(),
            title: "NestJS 협업에 관한 내용",
            document: "생성된 문서 원문",
            summary: "생성된 문서 요약",
            userId: 12,
            createdBy: "김영수",
            category: "DEV_DOC",
        }

        return mock
    }
}
