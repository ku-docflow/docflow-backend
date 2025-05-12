import {forwardRef, Module} from '@nestjs/common';
import {QuestionController} from './question.controller';
import {QuestionService} from './question.service';
import {AIService} from "../AI/AI.service";
import {QuestionRepository} from "./question.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Chatroom} from "../chatroom/chatroom.entity";
import {Message} from "../chatroom/message.entity";
import {QdrantModule} from "../qdrant/qdrant.module";
import {ChatModule} from '../chat/chat.module';
import {DocumentService} from "../document/document.service";
import {Document} from "../document/document.entity";
import {AIModule} from "../AI/AI.module";
import {EventsModule} from "../../common/events/events.module.";
import {ChatroomService} from "../chatroom/chatroom.service";
import {ChatroomParticipant} from "../chatroom/chatroom-participant.entity";

@Module({
    imports: [
        TypeOrmModule.forFeature([Chatroom, Message, Document, ChatroomParticipant]),
        QdrantModule,
        forwardRef(() => ChatModule),
        AIModule,
        EventsModule
    ],
    controllers: [QuestionController],
    providers: [QuestionService, QuestionRepository, DocumentService, ChatroomService],
    exports: [QuestionService],
})
export class QuestionModule {
}
