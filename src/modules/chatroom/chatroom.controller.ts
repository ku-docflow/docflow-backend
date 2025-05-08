import { Controller, Get, Query, Param, UseGuards, Req } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';

@UseGuards(FirebaseAuthGuard)
@Controller('chatroom')
export class ChatroomController {
	constructor(private readonly chatroomService: ChatroomService) { }

	@Get('team/:teamId')
	async getGroupMessages(@Param('teamId') teamId: string) {
		return this.chatroomService.getMessagesByTeamId(Number(teamId));
	}

	@Get('direct')
	async getDirectMessages(
		@Req() req: FirebaseRequest,
		@Query('peer_id') peerId: string,
	) {
		return this.chatroomService.getDirectMessages(req.user.id, peerId);
	}
}
