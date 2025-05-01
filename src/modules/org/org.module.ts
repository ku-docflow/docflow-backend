import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from './org.entity';
import { EventsModule } from 'src/common/events/events.module.';

@Module({
	imports: [TypeOrmModule.forFeature([Org]),
		EventsModule],
	controllers: [OrgController],
	providers: [OrgService],
})
export class OrgModule { }
