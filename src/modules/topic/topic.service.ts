import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './topic.entity';
import { EventManager } from 'src/common/events/event-manager';
import { Membership } from '../team/membership.entity';

@Injectable()
export class TopicService {
	constructor(
		@InjectRepository(Topic)
		private readonly topicRepo: Repository<Topic>,

		private readonly eventManager: EventManager,
	) { }

	async createTopic(organization_id: number, title: string): Promise<Topic> {
		const topic = this.topicRepo.create({ organization_id, title });
		const saved = await this.topicRepo.save(topic);

		const members = await this.topicRepo.manager
			.getRepository(Membership)
			.find({ where: { organization_id }, select: ['user_id'] });

		const userIds = members.map((m) => m.user_id);
		if (userIds.length > 0) {
			this.eventManager.emit('user.data_dirty', { userIds });
		}

		return saved;
	}

	async getTopicById(id: number): Promise<Topic> {
		const topic = await this.topicRepo.findOneBy({ id });
		if (!topic) throw new NotFoundException('Topic not found');
		return topic;
	}

	async getTopicsByOrganization(orgId: number): Promise<Topic[]> {
		return await this.topicRepo.find({ where: { organization_id: orgId } });
	}
}
