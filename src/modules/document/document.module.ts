import { Module } from '@nestjs/common';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from './document.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Document])],
	controllers: [DocumentController],
	providers: [DocumentService]
})
export class DocumentModule { }
