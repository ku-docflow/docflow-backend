import { Test, TestingModule } from '@nestjs/testing';
import { DocumentService } from './document.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { User } from '../user/user.entity';
import { EventManager } from "../../common/events/event-manager"
import { NotFoundException } from '@nestjs/common';

jest.mock('../py/api', () => ({
	DocApi: jest.fn().mockImplementation(() => ({
		saveDocument: jest.fn().mockResolvedValue(undefined),
	})),
}));

const mockRepo = () => ({
	findOneBy: jest.fn(),
	findOne: jest.fn(),
	find: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
	delete: jest.fn(),
	createQueryBuilder: jest.fn(() => ({
		innerJoin: jest.fn().mockReturnThis(),
		where: jest.fn().mockReturnThis(),
		getMany: jest.fn(),
	})),
	manager: {
		getRepository: jest.fn(() => ({
			findOneBy: jest.fn(),
			find: jest.fn(),
		})),
	},
});

describe('DocumentService', () => {
	let service: DocumentService;
	let documentRepo: any;
	let userRepo: any;
	let eventManager: any;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				DocumentService,
				{ provide: getRepositoryToken(Document), useFactory: mockRepo },
				{ provide: getRepositoryToken(User), useFactory: mockRepo },
				{ provide: EventManager, useValue: { emit: jest.fn() } },
			],
		}).compile();

		service = module.get(DocumentService);
		documentRepo = module.get(getRepositoryToken(Document));
		userRepo = module.get(getRepositoryToken(User));
		eventManager = module.get(EventManager);
	});

	it('createDocument - should save and return document', async () => {
		const topic = { id: 1, organization_id: 100 };
		const savedDoc = { id: 2, topic_id: 1, text: 'abc' };
		const members = [{ user_id: 'u1' }, { user_id: 'u2' }];

		documentRepo.manager.getRepository.mockReturnValueOnce({
			findOneBy: jest.fn().mockResolvedValue(topic),
		});
		documentRepo.create.mockReturnValue(savedDoc);
		documentRepo.save.mockResolvedValue(savedDoc);
		documentRepo.manager.getRepository.mockReturnValueOnce({
			find: jest.fn().mockResolvedValue(members),
		});

		const result = await service.createDocument(1, 'abc');
		expect(result).toEqual(savedDoc);
		expect(eventManager.emit).toHaveBeenCalledWith('user.data_dirty', {
			userIds: ['u1', 'u2'],
		});
	});

	it('createDocument - should throw if topic not found', async () => {
		documentRepo.manager.getRepository.mockReturnValueOnce({
			findOneBy: jest.fn().mockResolvedValue(null),
		});
		await expect(service.createDocument(99, 'text')).rejects.toThrow(NotFoundException);
	});

	it('getDocumentById - should return document', async () => {
		documentRepo.findOneBy.mockResolvedValue({ id: 1, text: 'hi' });
		const doc = await service.getDocumentById(1);
		expect(doc.text).toBe('hi');
	});

	it('getDocumentById - should throw if not found', async () => {
		documentRepo.findOneBy.mockResolvedValue(null);
		await expect(service.getDocumentById(99)).rejects.toThrow(NotFoundException);
	});

	it('deleteDocument - should delete document', async () => {
		const doc = { id: 1, topic: { organization_id: 100 } };
		const members = [{ user_id: 'x' }];

		documentRepo.findOne.mockResolvedValue(doc);
		documentRepo.delete.mockResolvedValue({ affected: 1 });
		documentRepo.manager.getRepository.mockReturnValueOnce({
			find: jest.fn().mockResolvedValue(members),
		});

		await service.deleteDocument(1);
		expect(eventManager.emit).toHaveBeenCalledWith('user.data_dirty', {
			userIds: ['x'],
		});
	});

	it('deleteDocument - not found', async () => {
		documentRepo.findOne.mockResolvedValue(null);
		await expect(service.deleteDocument(1)).rejects.toThrow(NotFoundException);
	});

	it('updateDocument - should update text and emit event', async () => {
		const doc = { id: 1, text: 'old', topic: { organization_id: 50 } };
		const members = [{ user_id: 'u1' }];
		documentRepo.findOne.mockResolvedValue(doc);
		documentRepo.save.mockResolvedValue({ ...doc, text: 'new' });
		documentRepo.manager.getRepository.mockReturnValueOnce({
			find: jest.fn().mockResolvedValue(members),
		});

		const result = await service.updateDocument(1, 'new');
		expect(result.text).toBe('new');
		expect(eventManager.emit).toHaveBeenCalled();
	});
});
