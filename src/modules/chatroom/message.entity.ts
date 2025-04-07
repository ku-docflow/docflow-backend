import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Chatroom } from './chatroom.entity';
import { User } from '../user/user.entity';

@Entity('message')
export class Message {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  chatroom_id: number;

  @Column()
  sender_id: string;

  @Column()
  text: string;

  @CreateDateColumn({ type: 'timestamptz' })
  timestamp: Date;

  @ManyToOne(() => Chatroom, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatroom_id' })
  chatroom: Chatroom;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;
}
