import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topic } from './topic.entity';
import { TopicService } from './topic.service';
import { TopicController } from './topic.controller';
import { EventsModule } from 'src/common/events/events.module.';

@Module({
	imports: [TypeOrmModule.forFeature([Topic]), EventsModule],
	providers: [TopicService],
	controllers: [TopicController],
	exports: [TopicService],
})
export class TopicModule { }
