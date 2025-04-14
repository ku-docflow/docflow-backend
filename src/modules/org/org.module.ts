import { Module } from '@nestjs/common';
import { OrgController } from './org.controller';
import { OrgService } from './org.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Org } from './org.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Org])],
  controllers: [OrgController],
  providers: [OrgService],
})
export class OrgModule {}
