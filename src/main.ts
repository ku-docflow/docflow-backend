import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	app.enableCors({
		origin: '*',
		credentials: true,
	});
	await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
