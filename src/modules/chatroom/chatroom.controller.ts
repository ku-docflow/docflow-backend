import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common';
import { ChatroomService } from './chatroom.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';

@UseGuards(FirebaseAuthGuard)
@Controller('chatroom')
export class ChatroomController {
  constructor(private readonly chatroomService: ChatroomService) {}

  @Get('team/:teamId')
  async getGroupMessages(@Param('teamId') teamId: string) {
    return this.chatroomService.getMessagesByTeamId(Number(teamId));
  }

  @Get('direct')
  async getDirectMessages(
    @Query('user_id') userId: string,
    @Query('peer_id') peerId: string,
  ) {
    return this.chatroomService.getDirectMessages(userId, peerId);
  }
}
