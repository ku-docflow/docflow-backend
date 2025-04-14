import {Injectable} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository, MoreThan} from 'typeorm';
import {Message} from '../chatroom/message.entity';

@Injectable()
export class ChatService {
    constructor(
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
    ) {
    }

    async saveMessage(chatroom_id: number, sender_id: string, text: string) {
        const message = this.messageRepo.create({
            chatroom_id,
            sender_id,
            text,
        });
        return this.messageRepo.save(message);
    }

    // desc / cursor pagination
    async getMessages(chatroom_id: number) {
        return this.messageRepo.find({
            where: {chatroom_id},
            order: {timestamp: 'ASC'},
        });
    }

    async getMessagesByRoomIdAndMinutes(chatroom_id: number, minutes: number): Promise<Message[]> {
        const thirtyMinutesAgo = new Date(Date.now() - minutes * 60 * 1000);

        return this.messageRepo.find({
            where: {
                chatroom_id,
                timestamp: MoreThan(thirtyMinutesAgo),
            },
            order: {timestamp: 'DESC'},
            take: 6,
        });
    }
}
