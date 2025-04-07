import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { OrgModule } from './modules/org/org.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamModule } from './modules/team/team.module';
import { UserModule } from './modules/user/user.module';
import { ChatroomModule } from './modules/chatroom/chatroom.module';
import dotenv from 'dotenv';
dotenv.config();

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
})
export class AppModule {}
