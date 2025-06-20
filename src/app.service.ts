import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './modules/user/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService implements OnModuleInit {
	private readonly logger = new Logger(AppService.name);

	constructor(
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
	) {
	}

	async onModuleInit() {
		await this.ensureBotUsersExist();
	}

	private async ensureBotUsersExist() {
		const botUsers = [
			{ id: 'gen-bot', last_name: '생성봇', },
			{ id: 'search-bot', last_name: '검색봇', },
		];

		for (const bot of botUsers) {
			const exists = await this.userRepository.findOne({ where: { last_name: '검색봇' } });
			const botUser = new User();
			botUser.id = bot.id;
			botUser.last_name = bot.last_name;
			botUser.created_at = new Date();
			const savedBot = await this.userRepository.save(this.userRepository.create(botUser));

			if (!exists) {
				this.logger.log(`🤖 Bot user created: ${savedBot.id}`);

			} else {
				this.logger.log(`✅ Bot user exists: ${savedBot.id}`);

			}
		}
	}
}
