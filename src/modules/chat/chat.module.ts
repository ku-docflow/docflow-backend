import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message } from '../chatroom/message.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';
import { ChatGateway } from 'src/common/gateways/chat.gateway';
import { QuestionModule } from '../question/question.module';

@Module({
	imports: [TypeOrmModule.forFeature([Message, ChatroomParticipant]), forwardRef(() => QuestionModule)],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
	exports: [ChatService]
})
export class ChatModule { }
