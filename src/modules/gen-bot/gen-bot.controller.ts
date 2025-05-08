import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { GenBotService } from "./gen-bot.service";
import { FirebaseAuthGuard } from "../../common/guards/firebase-auth.guard";
import { Response } from "express"
import { successCode, SuccessData, successMessage } from "../../common/middleware/response.middleware";
import { GenBotReqDto } from "./dto/gen-bot.req.dto";

// @UseGuards(FirebaseAuthGuard)
@Controller('gen-bot')
export class GenBotController {
	constructor(private readonly genBotService: GenBotService) {
	}


	@Post()
	async createDocument(
		@Body() query: GenBotReqDto,
		@Res() res: Response
	) {
		console.log(query);
		const mock = {
			documentId: 131231,
			organizationId: "b6f1b2e0",
			createdAt: new Date(),
			title: "NestJS 협업에 관한 내용",
			document: "생성된 문서 원문",
			summary: "생성된 문서 요약",
			userId: "user-1923",
			createdBy: "김영수",
			category: "DEV_DOC",
		}

		return mock
	}
}
