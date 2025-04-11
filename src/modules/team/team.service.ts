import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { Team } from './team.entity';
import { Chatroom } from '../chatroom/chatroom.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { Membership } from './membership.entity';
import { JoinTeamDto } from './dto/join-team.dto';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';

@Injectable()
export class TeamService {
  constructor(
    private readonly dataSource: DataSource,

    @InjectRepository(Team)
    private readonly teamRepo: Repository<Team>,

    @InjectRepository(Membership)
    private readonly membershipRepo: Repository<Membership>,
  ) {}

  async create(dto: CreateTeamDto, user_id: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const teamRepo = manager.getRepository(Team);
        const team = teamRepo.create({
          name: dto.name,
          organization_id: dto.organizationId,
        });
        const savedTeam = await teamRepo.save(team);

        const chatroomRepo = manager.getRepository(Chatroom);
        const chatroom = chatroomRepo.create({
          type: 'group',
          name: dto.name,
          team_id: savedTeam.id,
        });
        const savedChatroom = await chatroomRepo.save(chatroom);

        savedTeam.chatroom_id = savedChatroom.id;
        await teamRepo.save(savedTeam);

        const membership = manager.getRepository(Membership).create({
          user_id,
          organization_id: dto.organizationId,
          team_id: savedTeam.id,
          role: 'admin',
        });
        await manager.getRepository(Membership).save(membership);

        const participant = manager.getRepository(ChatroomParticipant).create({
          user_id,
          chatroom_id: savedChatroom.id,
        });
        await manager.getRepository(ChatroomParticipant).save(participant);

        return {
          success: true,
          team_id: savedTeam.id,
        };
      });
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === '23503') {
        throw new BadRequestException('Organization not found.');
      }
      throw err;
    }
  }

  async join(dto: JoinTeamDto, user_id: string) {
    const team = await this.teamRepo.findOne({
      where: { id: dto.team_id },
      relations: ['organization'],
    });
    if (!team) throw new NotFoundException('Team not found');

    const existing = await this.membershipRepo.findOne({
      where: {
        user_id,
        team_id: team.id,
      },
    });
    if (existing) throw new ForbiddenException('Already joined this team');

    const membership = this.membershipRepo.create({
      user_id,
      team_id: team.id,
      organization_id: team.organization_id,
      role: 'member',
    });
    await this.membershipRepo.save(membership);

    return { success: true };
  }

  async delete(id: number) {
    await this.membershipRepo.delete({ team_id: id });

    const result = await this.teamRepo.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Team not found');
    }

    return { success: true };
  }
}
