export interface AppEventMap {
	'user.data_dirty': {
		userIds: string[];
		chatroomIds: number[];
	};
}
