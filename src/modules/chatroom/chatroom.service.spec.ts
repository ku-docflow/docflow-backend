import { Test, TestingModule } from '@nestjs/testing';
import { ChatroomService } from './chatroom.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Chatroom } from './chatroom.entity';
import { Message } from './message.entity';
import { ChatroomParticipant } from './chatroom-participant.entity';
import { EventManager } from "../../common/events/event-manager"
import { Topic } from '../topic/topic.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

const mockRepo = () => ({
	findOne: jest.fn(),
	find: jest.fn(),
	findOneBy: jest.fn(),
	save: jest.fn(),
	create: jest.fn(),
});

describe('ChatroomService', () => {
	let service: ChatroomService;
	let chatroomRepo: jest.Mocked<Repository<Chatroom>>;
	let messageRepo: jest.Mocked<Repository<Message>>;
	let participantRepo: jest.Mocked<Repository<ChatroomParticipant>>;
	let topicRepo: jest.Mocked<Repository<Topic>>;
	let eventManager: EventManager;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ChatroomService,
				{ provide: getRepositoryToken(Chatroom), useFactory: mockRepo },
				{ provide: getRepositoryToken(Message), useFactory: mockRepo },
				{ provide: getRepositoryToken(ChatroomParticipant), useFactory: mockRepo },
				{ provide: getRepositoryToken(Topic), useFactory: mockRepo },
				{ provide: EventManager, useValue: { emit: jest.fn() } },
			],
		}).compile();

		service = module.get(ChatroomService);
		chatroomRepo = module.get(getRepositoryToken(Chatroom));
		messageRepo = module.get(getRepositoryToken(Message));
		participantRepo = module.get(getRepositoryToken(ChatroomParticipant));
		topicRepo = module.get(getRepositoryToken(Topic));
		eventManager = module.get(EventManager);
	});

	it('getMessagesByTeamId - throws if chatroom not found', async () => {
		chatroomRepo.findOne.mockResolvedValue(null);
		await expect(service.getMessagesByTeamId(1)).rejects.toThrow(NotFoundException);
	});

	it('getMessagesByTeamId - returns messages if chatroom exists', async () => {
		chatroomRepo.findOne.mockResolvedValue({ id: 1 } as any);
		messageRepo.find.mockResolvedValue([{ text: 'hello' }] as any);
		const res = await service.getMessagesByTeamId(1);
		expect(res.chatroom_id).toBe('1');
		expect(res.messages[0].text).toBe('hello');
	});

	it('getOrgIdByChatroomId - throws if chatroom not found', async () => {
		chatroomRepo.findOne.mockResolvedValue(null);
		await expect(service.getOrgIdByChatroomId(1)).rejects.toThrow(NotFoundException);
	});

	it('getOrgIdByChatroomId - returns organization id', async () => {
		chatroomRepo.findOne.mockResolvedValue({
			team: { organization: { id: 123 } },
		} as any);
		const res = await service.getOrgIdByChatroomId(1);
		expect(res).toBe(123);
	});

	it('getOrgIdByTopicId - throws if topic not found', async () => {
		topicRepo.findOne.mockResolvedValue(null);
		await expect(service.getOrgIdByTopicId(1)).rejects.toThrow(NotFoundException);
	});

	it('getOrgIdByTopicId - returns organization id', async () => {
		topicRepo.findOne.mockResolvedValue({ organization_id: 999 } as any);
		const res = await service.getOrgIdByTopicId(1);
		expect(res).toBe(999);
	});

	it('getMessagesBetweenIds - returns messages in range', async () => {
		const t1 = new Date('2024-01-01T00:00:00Z');
		const t2 = new Date('2024-01-01T00:01:00Z');
		messageRepo.findOne
			.mockResolvedValueOnce({ timestamp: t1 } as any)
			.mockResolvedValueOnce({ timestamp: t2 } as any);
		messageRepo.find.mockResolvedValue([{ id: 1 }] as any);
		const res = await service.getMessagesBetweenIds(1, 100, 200);
		expect(res[0].id).toBe(1);
	});

	it('getMessagesBetweenIds - returns empty array if one message not found', async () => {
		messageRepo.findOne.mockResolvedValueOnce(null);
		const res = await service.getMessagesBetweenIds(1, 100, 200);
		expect(res).toEqual([]);
	});
});
