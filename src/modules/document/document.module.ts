import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { Document } from './document.entity';
import { DocumentService } from './document.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [TypeOrmModule.forFeature([Document])],
	controllers: [DocumentController],
	providers: [DocumentService],
})
export class DocumentModule { }
