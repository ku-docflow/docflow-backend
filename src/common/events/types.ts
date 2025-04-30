export interface AppEventMap {
	'user.data_dirty': {
		userIds: string[];
	};

	'user.chatroom_join': {
		userId: string;
		chatroomIds: number[];
	};
}
