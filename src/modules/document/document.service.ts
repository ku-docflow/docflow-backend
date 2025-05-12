import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {In, Repository} from 'typeorm';
import { Document } from './document.entity';
import { EventManager } from 'src/common/events/event-manager';
import { Membership } from '../team/membership.entity';
import { Topic } from '../topic/topic.entity';

@Injectable()
export class DocumentService {
	constructor(
		@InjectRepository(Document)
		private readonly documentRepo: Repository<Document>,

		private readonly eventManager: EventManager,
	) { }

	async createDocument(topicId: number, text: string): Promise<Document> {
		const topic = await this.documentRepo.manager.getRepository(Topic).findOneBy({ id: topicId });
		if (!topic) throw new NotFoundException('Topic not found');

		const doc = this.documentRepo.create({ topic_id: topicId, text });
		const saved = await this.documentRepo.save(doc);

		const members = await this.documentRepo.manager
			.getRepository(Membership)
			.find({ where: { organization_id: topic.organization_id }, select: ['user_id'] });

		const userIds = members.map((m) => m.user_id);
		if (userIds.length > 0) {
			this.eventManager.emit('user.data_dirty', { userIds });
		}

		return saved;
	}

	async getDocumentsByTopic(topicId: number): Promise<Document[]> {
		return await this.documentRepo.find({ where: { topic_id: topicId } });
	}

	async getDocumentById(id: number): Promise<Document> {
		const doc = await this.documentRepo.findOneBy({ id });
		if (!doc) throw new NotFoundException('Document not found');
		return doc;
	}

	async getDocumentsByOrganization(orgId: number): Promise<Document[]> {
		return await this.documentRepo
			.createQueryBuilder('document')
			.innerJoin('document.topic', 'topic')
			.where('topic.organization_id = :orgId', { orgId })
			.getMany();
	}

	async updateDocument(id: number, text: string): Promise<Document> {
		const doc = await this.documentRepo.findOne({
			where: { id },
			relations: ['topic'],
		});
		if (!doc) throw new NotFoundException('Document not found');

		doc.text = text;
		const saved = await this.documentRepo.save(doc);

		const members = await this.documentRepo.manager
			.getRepository(Membership)
			.find({ where: { organization_id: doc.topic.organization_id }, select: ['user_id'] });

		const userIds = members.map((m) => m.user_id);
		if (userIds.length > 0) {
			this.eventManager.emit('user.data_dirty', { userIds });
		}

		return saved;
	}

	async deleteDocument(id: number): Promise<void> {
		const doc = await this.documentRepo.findOne({
			where: { id },
			relations: ['topic'],
		});
		if (!doc) throw new NotFoundException('Document not found');

		const orgId = doc.topic.organization_id;

		const result = await this.documentRepo.delete(id);
		if (result.affected === 0) throw new NotFoundException('Document not found');

		const members = await this.documentRepo.manager
			.getRepository(Membership)
			.find({ where: { organization_id: orgId }, select: ['user_id'] });

		const userIds = members.map((m) => m.user_id);
		if (userIds.length > 0) {
			this.eventManager.emit('user.data_dirty', { userIds });
		}
	}


	async getDocByIds(ids: number[]): Promise<Document[]> {
		return this.documentRepo.find({
			where: { id: In(ids) },
		});
	}

}
