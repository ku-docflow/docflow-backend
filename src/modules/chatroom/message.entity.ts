import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { Chatroom } from './chatroom.entity';
import { User } from '../user/user.entity';

export type Mention = {
	userId: string;
	startIndex: number;
	endIndex: number;
};

export enum MessageType {
	default = 'default',
	shared = 'shared'
}

@Entity('message')
export class Message {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@Column()
	chatroom_id: number;

	@Column()
	sender_id: string;

	@Column()
	text: string;

	@Column('jsonb', { nullable: true })
	mentions: Mention[];

	@Column({
		type: 'enum',
		enum: MessageType,
		default: MessageType.default,
	})
	type: MessageType;

	@CreateDateColumn({ type: 'timestamptz' })
	timestamp: Date;

	@ManyToOne(() => Chatroom, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'chatroom_id' })
	chatroom: Chatroom;

	@ManyToOne(() => User, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'sender_id' })
	sender: User;

	static formatMessagesWithLabels(messages: Message[]): string {
		const senderMap = Message.mapSendersToLabels(messages);
		return messages
			.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
			.map((m) => `${senderMap.get(m.sender_id) || '알 수 없음'}: ${m.text}`)
			.join('\n');
	}

	private static mapSendersToLabels(messages: Message[]): Map<string, string> {
		const uniqueSenders = Array.from(new Set(messages.map((m) => m.sender_id)));
		const senderMap = new Map<string, string>();
		if (uniqueSenders[0]) senderMap.set(uniqueSenders[0], '유저1');
		if (uniqueSenders[1]) senderMap.set(uniqueSenders[1], '유저2');
		return senderMap;
	}
}
