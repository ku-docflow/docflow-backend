import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../team/team.entity';
import { Membership } from '../team/membership.entity';
import { Chatroom } from '../chatroom/chatroom.entity';
import { User } from './user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Team, Membership, Chatroom, User])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
