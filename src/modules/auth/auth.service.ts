import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/user.entity';
import { Chatroom } from '../chatroom/chatroom.entity';

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,

		@InjectRepository(Chatroom)
		private readonly chatroomRepo: Repository<Chatroom>,
	) { }

	async login(id: string, email: string | undefined, first_name: string, last_name: string) {
		let user = await this.userRepo.findOneBy({ id });

		if (!user) {
			user = this.userRepo.create({ id, email, first_name, last_name });
			user = await this.userRepo.save(user);
		}

		if (!user.search_bot_chatroom_id) {
			const chatroom = this.chatroomRepo.create({
				type: 'bot',
				name: `검색봇 채팅방`,
				bot_user_id: user.id,
			});
			const savedChatroom = await this.chatroomRepo.save(chatroom);

			user.search_bot_chatroom_id = savedChatroom.id;
			await this.userRepo.save(user);
		}

		return {
			success: true,
			user,
		};
	}
}
