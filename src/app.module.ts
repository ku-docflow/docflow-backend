import {Module} from '@nestjs/common';
import {AuthModule} from './modules/auth/auth.module';
import {OrgModule} from './modules/org/org.module';
import {TypeOrmModule} from '@nestjs/typeorm';
import {TeamModule} from './modules/team/team.module';
import {ChatroomModule} from './modules/chatroom/chatroom.module';
import dotenv from 'dotenv';
import {envs} from './envs';
import {UserModule} from './modules/user/user.module';
import {ChatModule} from './modules/chat/chat.module';
import { QuestionModule } from './modules/question/question.module';
import { AIModule } from './modules/AI/AI.module';
import { QdrantModule } from './modules/qdrant/qdrant.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: envs.DB_HOST,
      port: envs.DB_PORT,
      username: envs.DB_USER,
      password: envs.DB_PASSWORD,
      database: envs.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    OrgModule,
    TeamModule,
    ChatroomModule,
    UserModule,
    ChatModule,
    QuestionModule,
    AIModule,
    QdrantModule,
  ],
})
export class AppModule {}
