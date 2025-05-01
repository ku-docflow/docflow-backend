import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './topic.entity';

@Injectable()
export class TopicService {
	constructor(
		@InjectRepository(Topic)
		private readonly topicRepo: Repository<Topic>
	) { }

	async createTopic(organization_id: number, title: string): Promise<Topic> {
		const topic = this.topicRepo.create({ organization_id, title });
		return await this.topicRepo.save(topic);
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
