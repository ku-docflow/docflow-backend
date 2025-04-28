import { Entity, PrimaryColumn, Column, CreateDateColumn, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user')
export class User {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@PrimaryColumn({ type: 'varchar' })
	firebase_id: string;

	@Column()
	name: string;

	@Column({ unique: true })
	email: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
