import {
	Controller,
	Post,
	Body,
	Patch,
	Param,
	Delete,
	HttpCode,
	UseGuards,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { EditOrgDto } from './dto/edit-org.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';

@Controller('org')
@UseGuards(FirebaseAuthGuard)
export class OrgController {
	constructor(private readonly orgService: OrgService) { }

	@Post()
	create(@Body() dto: CreateOrgDto) {
		return this.orgService.create(dto);
	}

	@Patch(':id')
	@HttpCode(200)
	edit(@Param('id') id: string, @Body() dto: EditOrgDto) {
		return this.orgService.edit(Number(id), dto);
	}

	@Delete(':id')
	@HttpCode(200)
	delete(@Param('id') id: string) {
		return this.orgService.delete(Number(id));
	}
}
