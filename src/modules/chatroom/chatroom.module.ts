import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chatroom } from './chatroom.entity';
import { Message } from './message.entity';
import { ChatroomParticipant } from './chatroom-participant.entity';
import { ChatroomService } from './chatroom.service';
import { ChatroomController } from './chatroom.controller';
import { Team } from '../team/team.entity';
import { EventsModule } from 'src/common/events/events.module.';
import { Topic } from '../topic/topic.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Chatroom, Message, ChatroomParticipant, Team, Topic]),
		EventsModule
	],
	controllers: [ChatroomController],
	providers: [ChatroomService],
	exports: [ChatroomService],
})
export class ChatroomModule { }
