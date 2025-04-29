import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';
import { Message } from '../chatroom/message.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Message, ChatroomParticipant])],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
	exports: [ChatService]
})
export class ChatModule { }
