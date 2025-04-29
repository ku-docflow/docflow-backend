import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
} from 'typeorm';
import { Team } from '../team/team.entity';

@Entity('document')
export class Document {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@ManyToOne(() => Team, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'team_id' })
	team: Team;

	@Column({ type: 'bigint' })
	team_id: number;

	@Column('text')
	text: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
