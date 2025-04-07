import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chatroom } from './chatroom.entity';
import { Message } from './message.entity';
import { ChatroomParticipant } from './chatroom-participant.entity';

@Injectable()
export class ChatroomService {
  constructor(
    @InjectRepository(Chatroom)
    private chatroomRepo: Repository<Chatroom>,

    @InjectRepository(Message)
    private messageRepo: Repository<Message>,

    @InjectRepository(ChatroomParticipant)
    private participantRepo: Repository<ChatroomParticipant>,
  ) {}

  async getMessagesByTeamId(teamId: number) {
    const chatroom = await this.chatroomRepo.findOne({
      where: { team_id: teamId },
    });
    if (!chatroom) throw new NotFoundException('Chatroom not found');

    const messages = await this.messageRepo.find({
      where: { chatroom_id: chatroom.id },
      order: { timestamp: 'ASC' },
    });

    return {
      chatroom_id: chatroom.id,
      messages,
    };
  }

  async getDirectMessages(userId: string, peerId: string) {
    const dmKey = [userId, peerId].sort().join('-');

    let chatroom = await this.chatroomRepo.findOneBy({ dm_key: dmKey });

    if (!chatroom) {
      chatroom = await this.chatroomRepo.save(
        this.chatroomRepo.create({
          type: 'dm',
          dm_key: dmKey,
        }),
      );

      await this.participantRepo.save([
        this.participantRepo.create({
          user_id: userId,
          chatroom_id: chatroom.id,
        }),
        this.participantRepo.create({
          user_id: peerId,
          chatroom_id: chatroom.id,
        }),
      ]);
    }

    const messages = await this.messageRepo.find({
      where: { chatroom_id: chatroom.id },
      order: { timestamp: 'ASC' },
    });

    return {
      chat_room_id: chatroom.id,
      messages,
    };
  }
}
