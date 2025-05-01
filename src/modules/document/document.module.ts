import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { Topic } from '../topic/topic.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Document, Topic])],
	controllers: [DocumentController],
	providers: [DocumentService],
})
export class DocumentModule { }
