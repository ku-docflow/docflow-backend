import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { OrgModule } from './org/org.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TeamModule } from './team/team.module';
import { UserModule } from './user/user.module';
import * as dotenv from 'dotenv';

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
	],
	controllers: [AppController],
	providers: [AppService],
})
export class AppModule { }
