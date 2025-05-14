import { Message } from '../../modules/chatroom/message.entity';

export interface AppEventMap {
	'user.data_dirty': {
		userIds: string[];
	};

	'user.chatroom_join': {
		userId: string;
		chatroomIds: number[];
	};

	'gen-bot.completed':{
		chatroomId: number;
		message: Message;
	}
}
