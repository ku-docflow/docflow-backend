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
// import { QuestionGateway } from 'src/common/gateways/question.gateway';

@Module({
	imports: [
		TypeOrmModule.forFeature([Chatroom, Message]),
		QdrantModule,
		forwardRef(() => ChatModule)
	],
	controllers: [QuestionController],
	providers: [QuestionService, AIService, QuestionRepository],
	exports: [QuestionService],
})
export class QuestionModule {
}
