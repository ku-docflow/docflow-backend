import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { Chatroom } from './chatroom.entity';
import { User } from '../auth/user.entity';

@Entity('chatroom_participant')
export class ChatroomParticipant {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  user_id: string;

  @Column({ type: 'bigint' })
  chatroom_id: number;

  @ManyToOne(() => Chatroom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatroom_id' })
  chatroom: Chatroom;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
