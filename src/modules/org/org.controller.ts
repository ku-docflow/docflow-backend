import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { OrgService } from './org.service';
import { CreateOrgDto } from './dto/create-org.dto';
import { EditOrgDto } from './dto/edit-org.dto';
import { FirebaseAuthGuard } from 'src/common/guards/firebase-auth.guard';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';

@Controller('org')
@UseGuards(FirebaseAuthGuard)
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Post()
  create(@Req() req: FirebaseRequest, @Body() dto: CreateOrgDto) {
    return this.orgService.create(dto, req.user.id);
  }

  @Patch(':id')
  edit(@Param('id') id: string, @Body() dto: EditOrgDto) {
    return this.orgService.edit(Number(id), dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.orgService.delete(Number(id));
  }
}
