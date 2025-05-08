import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/user.entity';
import { Chatroom } from '../chatroom/chatroom.entity';

@Module({
	imports: [TypeOrmModule.forFeature([User, Chatroom])],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule { }
