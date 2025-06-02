import { Test, TestingModule } from '@nestjs/testing';
import { OrgService } from './org.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Org } from './org.entity';
import { Repository, DataSource } from 'typeorm';
import { EventManager } from "../../common/events/event-manager"
import { ConflictException } from '@nestjs/common';
import { CreateOrgDto } from './dto/create-org.dto';

const mockOrgRepo = () => ({
	update: jest.fn(),
	delete: jest.fn(),
});

const mockDataSource = () => ({
	transaction: jest.fn(),
	getRepository: jest.fn(),
});

describe('OrgService', () => {
	let service: OrgService;
	let orgRepo: jest.Mocked<Repository<Org>>;
	let dataSource: ReturnType<typeof mockDataSource>;
	let eventManager: { emit: jest.Mock };

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				OrgService,
				{ provide: getRepositoryToken(Org), useFactory: mockOrgRepo },
				{ provide: DataSource, useFactory: mockDataSource },
				{ provide: EventManager, useValue: { emit: jest.fn() } },
			],
		}).compile();

		service = module.get(OrgService);
		orgRepo = module.get(getRepositoryToken(Org));
		dataSource = module.get(DataSource);
		eventManager = module.get(EventManager);
	});

	describe('create', () => {
		it('should create organization and emit events', async () => {
			const dto: CreateOrgDto = { name: 'NewOrg' };
			const userId = 'user123';

			dataSource.transaction.mockImplementation(async (cb) => {
				return cb({
					create: jest.fn().mockImplementation((_, obj) => obj),
					save: jest.fn().mockImplementation(async (x) => ({ ...x, id: 10 })),
				});
			});

			const res = await service.create(dto, userId);
			expect(res.success).toBe(true);
			expect(eventManager.emit).toHaveBeenCalledWith('user.data_dirty', {
				userIds: [userId],
			});
			expect(eventManager.emit).toHaveBeenCalledWith('user.chatroom_join', {
				userId,
				chatroomIds: [10],
			});
		});

		it('should throw ConflictException on duplicate error', async () => {
			dataSource.transaction.mockRejectedValue({ code: '23505' });

			await expect(service.create({ name: 'dup' }, 'u')).rejects.toThrow(ConflictException);
		});
	});
});
