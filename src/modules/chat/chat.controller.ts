import { Controller, Get, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  async getMessages(@Query('chatroom_id') chatroom_id: number) {
    return this.chatService.getMessages(chatroom_id);
  }
}
