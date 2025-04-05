import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
} from 'typeorm';

@Entity('organization')
export class Org {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@Column({ unique: true })
	name: string;

	@Column()
	email: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
