import {
	Controller,
	Post,
	Get,
	Patch,
	Delete,
	Param,
	Body,
	UseGuards, Req,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from '../../common/interfaces/firebase-request.interface';

@Controller('document')
@UseGuards(FirebaseAuthGuard)
export class DocumentController {
	constructor(private readonly documentService: DocumentService) {
	}

	@Post()
	create(
		@Req() req: FirebaseRequest,
		@Body() body: { topic_id: number; text: string }) {
		return this.documentService.createDocumentWithVector(req.user.id,body.topic_id, body.text);
	}

	@Get('topic/:id')
	getByTopic(@Param('id') id: string) {
		return this.documentService.getDocumentsByTopic(Number(id));
	}

	@Get(':id')
	getOne(@Param('id') id: string) {
		return this.documentService.getDocumentById(Number(id));
	}

	@Get('org/:orgId')
	getByOrganization(@Param('orgId') orgId: string) {
		return this.documentService.getDocumentsByOrganization(Number(orgId));
	}

	@Patch(':id')
	update(@Param('id') id: string, @Body() body: { text: string }) {
		return this.documentService.updateDocument(Number(id), body.text);
	}

	@Delete(':id')
	delete(@Param('id') id: string) {
		return this.documentService.deleteDocument(Number(id));
	}
}
