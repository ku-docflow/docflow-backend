import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) { }

	async login(id: string, email: string | undefined, first_name: string, last_name: string) {
		let user = await this.userRepo.findOneBy({ id });

		if (!user) {
			user = this.userRepo.create({ id, email, first_name, last_name });
			user = await this.userRepo.save(user);
		}

		return {
			success: true,
			user,
		};
	}
}
