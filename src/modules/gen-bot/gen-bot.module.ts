import {forwardRef, Module} from '@nestjs/common';
import {GenBotController} from './gen-bot.controller';
import {GenBotService} from './gen-bot.service';
import {AIModule} from "../AI/AI.module";
import {ChatroomService} from "../chatroom/chatroom.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Chatroom} from "../chatroom/chatroom.entity";
import {Message} from "../chatroom/message.entity";
import {Document} from "../document/document.entity";
import {ChatroomParticipant} from "../chatroom/chatroom-participant.entity";
import {QdrantModule} from "../qdrant/qdrant.module";
import {ChatModule} from "../chat/chat.module";
import {EventsModule} from "../../common/events/events.module.";
import {DocumentService} from "../document/document.service";
import {EventManager} from "../../common/events/event-manager";

@Module({
    imports: [
        TypeOrmModule.forFeature([ Message,Document, Chatroom, ChatroomParticipant]),
        AIModule,
    ],
    controllers: [GenBotController],
    providers: [GenBotService, ChatroomService, DocumentService, EventManager]
})
export class GenBotModule {
}
