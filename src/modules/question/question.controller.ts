import { Body, Controller, Post } from '@nestjs/common';
import { SemanticSearchRequestDto } from "./dto/question.req.dto";
import { QuestionService } from "./question.service";
import { SearchBotReferenceDto, SearchBotResponseDto } from "./dto/question.res.dto";

// @UseGuards(FirebaseAuthGuard)
@Controller('question')
export class QuestionController {
	constructor(private readonly questionService: QuestionService) {
	}

	//
	// when: chatroom + userId 기반 검색 후
	// Todo: 해당 유저가 chatroom에 권한이 있는지 확인
	@Post()
	async getQuestionQuery(
		@Body() query: SemanticSearchRequestDto,
		// @Res() res: Response,
	) {
		console.log(query);
		const searchResult: SearchBotReferenceDto[] = await this.questionService.getSearch(query);
		return searchResult;

	}


	@Post('rag')
	async getRagSearchBot(
		@Body() query: SemanticSearchRequestDto,
	) {
		console.log(query);
		const ragResult: SearchBotResponseDto = await this.questionService.getRagSearch(query)
		return ragResult;
	}

}

