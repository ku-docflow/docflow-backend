import {
  Controller,
  Post,
  Body,
  Delete,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { TeamService } from './team.service';
import { CreateTeamDto } from './dto/create-team.dto';
import { JoinTeamDto } from './dto/join-team.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';

@Controller('team')
@UseGuards(FirebaseAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Post()
  create(@Req() req: FirebaseRequest, @Body() dto: CreateTeamDto) {
    return this.teamService.create(dto, req.user.id);
  }

  @Post('join')
  join(@Req() req: FirebaseRequest, @Body() dto: JoinTeamDto) {
    return this.teamService.join(dto, req.user.id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.teamService.delete(Number(id));
  }
}
