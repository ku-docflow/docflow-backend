import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { Membership } from './membership.entity';
import { Chatroom } from 'src/chatroom/chatroom.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Team, Membership, Chatroom])],
	controllers: [TeamController],
	providers: [TeamService],
})
export class TeamModule { }
