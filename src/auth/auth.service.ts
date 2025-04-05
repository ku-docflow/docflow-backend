import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
	) { }

	async loginOrSignup(
		id: string,
		email: string | undefined,
		_provider: string,
	) {
		let user = await this.userRepo.findOneBy({ id });

		const isNewUser = !user;

		if (!user) {
			user = this.userRepo.create({ id, email });
			user = await this.userRepo.save(user);
		}

		return {
			success: true,
			message: isNewUser ? 'User registered successfully' : 'Login successful',
			user,
		};
	}
}
