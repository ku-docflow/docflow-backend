import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('document')
export class Document {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@Column('text')
	text: string;

	@CreateDateColumn({ type: 'timestamp' })
	created_at: Date;
}
