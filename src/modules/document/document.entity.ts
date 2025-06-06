import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	JoinColumn,
	CreateDateColumn,
} from 'typeorm';
import { Topic } from '../topic/topic.entity';

@Entity('document')
export class Document {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@ManyToOne(() => Topic, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'topic_id' })
	topic: Topic;

	@Column({ type: 'bigint' })
	topic_id: number;

	@Column('text')
	text: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
