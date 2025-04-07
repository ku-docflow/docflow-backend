import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Check,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatroomParticipant } from './chatroom-participant.entity';
import { Team } from '../team/team.entity';

@Entity('chatroom')
@Check(`"type" IN ('dm', 'group')`)
export class Chatroom {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar' })
  type: 'dm' | 'group';

  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  dm_key: string;

  @OneToMany(() => ChatroomParticipant, (p) => p.chatroom)
  participants: ChatroomParticipant[];

  @ManyToOne(() => Team, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({ type: 'bigint', nullable: true })
  team_id: number;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
