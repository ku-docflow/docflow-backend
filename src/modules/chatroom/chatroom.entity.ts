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
export class Chatroom {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@Check(`"type" IN ('dm', 'group', 'bot')`)
	@Column()
	type: 'dm' | 'group' | 'bot';

	@Column({ nullable: true })
	name: string;

	@Column({ type: 'varchar', unique: true, nullable: true })
	dm_key: string;

	@OneToMany(() => ChatroomParticipant, (p) => p.chatroom)
	participants: ChatroomParticipant[];

	@Column({ type: 'varchar', nullable: true, unique: true })
	bot_user_id: string;

	@ManyToOne(() => Team, { nullable: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'team_id' })
	team: Team;

	@Column({ type: 'bigint', nullable: true })
	team_id: number;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
