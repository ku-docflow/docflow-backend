import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	ManyToOne,
	JoinColumn,
} from 'typeorm';
import { User } from 'src/modules/user/user.entity';
import { Org } from 'src/modules/org/org.entity';
import { Team } from './team.entity';

@Entity('membership')
export class Membership {
	@PrimaryGeneratedColumn('increment', { type: 'bigint' })
	id: number;

	@ManyToOne(() => User)
	@JoinColumn({ name: 'user_id' })
	user: User;

	@Column({ type: 'varchar' })
	user_id: string;

	@ManyToOne(() => Org, { onDelete: 'CASCADE' })
	@JoinColumn({ name: 'organization_id' })
	organization: Org;

	@Column({ type: 'bigint' })
	organization_id: number;

	@ManyToOne(() => Team, { nullable: true, onDelete: 'CASCADE' })
	@JoinColumn({ name: 'team_id' })
	team: Team;

	@Column({ type: 'bigint', nullable: true })
	team_id: number;

	@Column({ type: 'varchar' })
	role: 'member' | 'admin';

	@CreateDateColumn({ type: 'timestamptz' })
	joined_at: Date;
}
