import { forwardRef, Module } from '@nestjs/common';
import { QuestionController } from './question.controller';
import { QuestionService } from './question.service';
import { AIService } from "../AI/AI.service";
import { QuestionRepository } from "./question.repository";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Chatroom } from "../chatroom/chatroom.entity";
import { Message } from "../chatroom/message.entity";
import { QdrantModule } from "../qdrant/qdrant.module";
import { ChatModule } from '../chat/chat.module';
import {DocumentService} from "../document/document.service";
import {Document} from "../document/document.entity";
import {AIModule} from "../AI/AI.module";
import {EventsModule} from "../../common/events/events.module.";

@Module({
	imports: [
		TypeOrmModule.forFeature([Chatroom, Message, Document]),
		QdrantModule,
		forwardRef(() => ChatModule),
		AIModule,
		EventsModule
	],
	controllers: [QuestionController],
	providers: [QuestionService, QuestionRepository, DocumentService],
	exports: [QuestionService],
})
export class QuestionModule {}
