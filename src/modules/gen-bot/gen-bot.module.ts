import {Module} from '@nestjs/common';
import {GenBotController} from './gen-bot.controller';
import {GenBotService} from './gen-bot.service';
import {AIModule} from "../AI/AI.module";

@Module({
    controllers: [GenBotController],
    providers: [GenBotService]
})
export class GenBotModule {
}
