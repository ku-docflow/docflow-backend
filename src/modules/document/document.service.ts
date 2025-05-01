import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './document.entity';

@Injectable()
export class DocumentService {
	constructor(
		@InjectRepository(Document)
		private readonly documentRepo: Repository<Document>
	) { }

	async createDocument(topicId: number, text: string): Promise<Document> {
		const doc = this.documentRepo.create({ topic_id: topicId, text });
		return await this.documentRepo.save(doc);
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
		const doc = await this.getDocumentById(id);
		doc.text = text;
		return await this.documentRepo.save(doc);
	}

	async deleteDocument(id: number): Promise<void> {
		const result = await this.documentRepo.delete(id);
		if (result.affected === 0) throw new NotFoundException('Document not found');
	}
}
