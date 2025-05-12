import { Body, Controller, Post } from '@nestjs/common';
import { GenBotService } from './gen-bot.service';
import { GenBotRequestDto } from './dto/gen-bot.dto';

// @UseGuards(FirebaseAuthGuard)
@Controller('gen-bot')
export class GenBotController {
    constructor(private readonly genBotService: GenBotService) {
    }


    @Post()
    async createDocument(
        // @Req() req: FirebaseRequest,
        @Body() query: GenBotRequestDto,
    ) {
        console.log(query);

        return this.genBotService.createDocByBot('userId', query)
    }
}
