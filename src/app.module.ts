import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { OrgModule } from './modules/org/org.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamModule } from './modules/team/team.module';
import { ChatroomModule } from './modules/chatroom/chatroom.module';
import dotenv from 'dotenv';
import { envs } from './envs';
import { UserModule } from './modules/user/user.module';
import { ChatModule } from './modules/chat/chat.module';
import { QuestionModule } from './modules/question/question.module';
import { AIModule } from './modules/AI/AI.module';
import { QdrantModule } from './modules/qdrant/qdrant.module';
import { DocumentModule } from './modules/document/document.module';
import { EventManager } from './common/events/event-manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { GatewayModule } from './common/gateways/gateway.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { TopicModule } from './modules/topic/topic.module';
import { GenBotModule } from './modules/gen-bot/gen-bot.module';

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
		DocumentModule,
		GatewayModule,
      GenBotModule,
		EventEmitterModule.forRoot()
	],
	providers: [EventManager],
	controllers: [],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(LoggerMiddleware).forRoutes('*');
	}
}
