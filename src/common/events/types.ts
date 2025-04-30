export interface AppEventMap {
	'team.updated': { teamId: number; name: string };
	'team.member_joined': { teamId: number; userId: string };
	'chatroom.created': { chatroomId: number; teamId: number };
}
