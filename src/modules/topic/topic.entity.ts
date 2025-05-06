import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Org } from '../org/org.entity';

@Entity('topic')
export class Topic {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@ManyToOne(() => Org, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'organization_id' })
	organization: Org;

	@Column({ type: 'bigint' })
	organization_id: number;

	@Column()
	title: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
