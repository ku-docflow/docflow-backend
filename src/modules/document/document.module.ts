import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { EventsModule } from 'src/common/events/events.module.';
import { User } from '../user/user.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Document, User]), EventsModule],
	controllers: [DocumentController],
	providers: [DocumentService],
})
export class DocumentModule { }
