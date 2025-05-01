import {
	Controller,
	Post,
	Get,
	Param,
	Body,
	UseGuards,
} from '@nestjs/common';
import { TopicService } from './topic.service';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';

@Controller('topic')
@UseGuards(FirebaseAuthGuard)
export class TopicController {
	constructor(private readonly topicService: TopicService) { }

	@Post()
	create(@Body() body: { organization_id: number; title: string }) {
		return this.topicService.createTopic(body.organization_id, body.title);
	}

	@Get(':id')
	getById(@Param('id') id: string) {
		return this.topicService.getTopicById(Number(id));
	}

	@Get('org/:orgId')
	getByOrg(@Param('orgId') orgId: string) {
		return this.topicService.getTopicsByOrganization(Number(orgId));
	}
}
