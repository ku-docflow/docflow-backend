import { Entity, PrimaryColumn, Column, CreateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { Chatroom } from '../chatroom/chatroom.entity';

@Entity('user')
export class User {
	@PrimaryColumn({ type: 'varchar' })
	id: string;

	@Column()
	first_name: string;

	@Column()
	last_name: string;

	@OneToOne(() => Chatroom)
	@JoinColumn({ name: 'search_bot_chatroom_id' })
	search_bot_chatroom: Chatroom;

	@Column({ type: 'bigint', nullable: true })
	search_bot_chatroom_id: number;

	@Column({ unique: true })
	email: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
