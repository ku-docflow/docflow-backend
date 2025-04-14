import {Module} from '@nestjs/common';
import {QuestionController} from './question.controller';
import {QuestionService} from './question.service';
import {ChatService} from "../chat/chat.service";
import {AIService} from "../AI/AI.service";
import {QuestionRepository} from "./question.repository";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Chatroom} from "../chatroom/chatroom.entity";
import {Message} from "../chatroom/message.entity";
import {ChatroomParticipant} from "../chatroom/chatroom-participant.entity";
import {Team} from "../team/team.entity";
import {QdrantModule} from "../qdrant/qdrant.module";

@Module({
    imports: [
        TypeOrmModule.forFeature([Chatroom, Message]),
        QdrantModule
    ],
    controllers: [QuestionController],
    providers: [QuestionService, ChatService, AIService, QuestionRepository]
})
export class QuestionModule {
}
