import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Document } from './document.entity';
import { EventManager } from "../../common/events/event-manager"
import { Membership } from '../team/membership.entity';
import { Topic } from '../topic/topic.entity';
import { SaveDocumentRequest } from '../py/dto/pythonApiDto';
import { User } from '../user/user.entity';
import { DocApi } from '../py/api';

@Injectable()
export class DocumentService {
	constructor(
		@InjectRepository(Document)
		private readonly documentRepo: Repository<Document>,
		@InjectRepository(User)
		private readonly userRepo: Repository<User>,
		private readonly eventManager: EventManager,
	) {
	}

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

	async createDocumentWithVector(userId: string, topicId: number, text: string): Promise<Document> {
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

		const user = await this.userRepo.findOneByOrFail({ id: userId });
		if (!user) {
			throw new NotFoundException('유저를 찾을 수 없습니다', userId);
		}
		const documentRequest: SaveDocumentRequest = {
			documentId: saved.id,
			organizationId: topic.organization_id,
			content: saved.text,
			userId: userId,
			createdBy: user.first_name + user.last_name,
			createdAt: saved.created_at,
		};
		const api = new DocApi();
		api.saveDocument(documentRequest).catch((error) => {
			throw new InternalServerErrorException(`문서 벡터화에 실패 ${error}`);
		});
		console.log(saved);
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
	async updateDocumentWithVector(id: number, text: string): Promise<Document> {
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
		const documentRequest: SaveDocumentRequest = {
			documentId: saved.id,
			content: saved.text,
		};
		const api = new DocApi();
		api.saveDocument(documentRequest).catch((error) => {
			throw new InternalServerErrorException(`문서 벡터화에 실패 ${error}`);
		});

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
