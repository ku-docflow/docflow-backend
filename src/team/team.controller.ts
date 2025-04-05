import {
	Controller,
	Post,
	Body,
	Delete,
	HttpCode,
	UseGuards,
	Req,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { DeleteTeamDto } from './dto/delete-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';

@Controller('team')
@UseGuards(FirebaseAuthGuard)
export class TeamController {
	constructor(private readonly teamService: TeamService) { }

	@Post('create')
	create(@Body() dto: CreateTeamDto) {
		return this.teamService.create(dto);
	}

	@Post('join')
	join(@Req() req: FirebaseRequest, @Body() dto: JoinTeamDto) {
		return this.teamService.join(dto, req.user.id);
	}

	@Delete('delete')
	delete(@Body() dto: DeleteTeamDto) {
		return this.teamService.delete(dto);
	}
}
