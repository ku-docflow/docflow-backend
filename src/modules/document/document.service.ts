import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { Repository, In } from 'typeorm';

@Injectable()
export class DocumentService {
	constructor(
		@InjectRepository(Document)
		private readonly docRepo: Repository<Document>,
	) { }


	async getDocByIds(ids: number[]): Promise<Document[]> {
		return this.docRepo.find({
			where: { id: In(ids) },
		});
	}
}
