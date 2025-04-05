import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	Check,
} from 'typeorm';

@Entity('chatroom')
@Check(`"type" IN ('dm', 'group')`)
export class Chatroom {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: string;

	@Column({ type: 'varchar' })
	type: 'dm' | 'group';

	@Column({ type: 'varchar', nullable: true })
	name: string;

	@Column({ type: 'varchar', unique: true, nullable: true })
	dm_key: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
