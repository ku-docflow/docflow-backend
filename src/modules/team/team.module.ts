import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { Membership } from './membership.entity';
import { Chatroom } from '../chatroom/chatroom.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';
import { EventsModule } from 'src/common/events/events.module.';

@Module({
	imports: [
		TypeOrmModule.forFeature([Team, Membership, Chatroom, ChatroomParticipant]),
		EventsModule
	],
	controllers: [TeamController],
	providers: [TeamService],
})
export class TeamModule { }
