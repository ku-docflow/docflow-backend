import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { Message } from '../chatroom/message.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';
import { ChatGateway } from 'src/common/gateways/chat.gateway';

@Module({
	imports: [TypeOrmModule.forFeature([Message, ChatroomParticipant])],
	controllers: [ChatController],
	providers: [ChatService, ChatGateway],
	exports: [ChatService]
})
export class ChatModule { }
