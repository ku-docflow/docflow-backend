import { Module } from '@nestjs/common';
import { TeamController } from './team.controller';
import { TeamService } from './team.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from './team.entity';
import { Membership } from './membership.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Team, Membership])],
	controllers: [TeamController],
	providers: [TeamService],
})
export class TeamModule { }
