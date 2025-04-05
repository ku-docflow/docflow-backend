import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OrgModule } from './org/org.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';
import { ChatroomService } from './chatroom/chatroom.service';
import { ChatroomController } from './chatroom/chatroom.controller';
import { ChatroomModule } from './chatroom/chatroom.module';

@Module({
	imports: [
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'postgres',
			password: 'postgres',
			database: 'docflow',
			autoLoadEntities: true,
			synchronize: true,
		}),
		AuthModule,
		OrgModule,
		TeamModule,
		UserModule,
		ChatroomModule,
	],
	controllers: [ChatroomController],
	providers: [ChatroomService],
})
export class AppModule { }
