import { Test, TestingModule } from '@nestjs/testing';
import { GenBotService } from './gen-bot.service';

describe('GenBotService', () => {
  let service: GenBotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GenBotService],
    }).compile();

    service = module.get<GenBotService>(GenBotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
