import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Org } from '../org/org.entity';
import { Chatroom } from '../chatroom/chatroom.entity';

@Entity('team')
export class Team {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Org, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Org;

  @Column({ type: 'bigint' })
  organization_id: number;

  @ManyToOne(() => Chatroom, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chatroom_id' })
  chatroom: Chatroom;

  @Column({ type: 'bigint', nullable: true })
  chatroom_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
