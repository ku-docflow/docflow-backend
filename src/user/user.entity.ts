import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@Column({ unique: true })
	firebase_uid: string;

	@Column()
	email: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
