import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Message } from '../chatroom/message.entity';
import { ChatroomParticipant } from '../chatroom/chatroom-participant.entity';
import { Repository } from 'typeorm';

const mockMessageRepo = () => ({
	create: jest.fn(),
	save: jest.fn(),
	findOne: jest.fn(),
	find: jest.fn(),
});

const mockParticipantRepo = () => ({
	find: jest.fn(),
});

describe('ChatService', () => {
	let service: ChatService;
	let messageRepo: jest.Mocked<Repository<Message>>;
	let participantRepo: jest.Mocked<Repository<ChatroomParticipant>>;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				ChatService,
				{ provide: getRepositoryToken(Message), useFactory: mockMessageRepo },
				{ provide: getRepositoryToken(ChatroomParticipant), useFactory: mockParticipantRepo },
			],
		}).compile();

		service = module.get(ChatService);
		messageRepo = module.get(getRepositoryToken(Message));
		participantRepo = module.get(getRepositoryToken(ChatroomParticipant));
	});


	describe('getMessages', () => {
		it('should return formatted messages', async () => {
			const messages = [{
				id: 1,
				text: 'hello',
				chatroom_id: 1,
				timestamp: new Date(),
				type: 'TEXT',
				sender: { id: 1, first_name: 'A', last_name: 'B' },
				mentions: [],
				shared_message_id: null,
				shared_message_sender: null,
			}];
			messageRepo.find.mockResolvedValue(messages as any);

			const res = await service.getMessages(1);
			expect(res.chatroom_id).toBe('1');
			expect(res.messages).toHaveLength(1);
			expect(res.messages[0].text).toBe('hello');
		});
	});

	describe('findChatroomIdsByUserId', () => {
		it('should return chatroom ids', async () => {
			participantRepo.find.mockResolvedValue([
				{ chatroom_id: 1 },
				{ chatroom_id: 2 },
			] as any);

			const res = await service.findChatroomIdsByUserId('123');
			expect(res).toEqual([1, 2]);
		});
	});
});
