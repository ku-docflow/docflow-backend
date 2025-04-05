import {
	Injectable,
	NotFoundException,
	ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from './team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { Membership } from './membership.entity';
import { } from '@nestjs/common';
import { JoinTeamDto } from './dto/join-team.dto';

@Injectable()
export class TeamService {
	constructor(
		@InjectRepository(Team)
		private readonly teamRepo: Repository<Team>,

		@InjectRepository(Membership)
		private readonly membershipRepo: Repository<Membership>,
	) { }

	async create(dto: CreateTeamDto, user_id: string) {
		const team = this.teamRepo.create({
			name: dto.name,
			organization_id: dto.organization_id,
		});
		const saved = await this.teamRepo.save(team);

		const membership = this.membershipRepo.create({
			user_id,
			organization_id: dto.organization_id,
			team_id: saved.id,
			role: 'admin',
		});
		await this.membershipRepo.save(membership);

		return {
			success: true,
			team_id: saved.id,
		};
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
