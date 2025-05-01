import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as process from "node:process";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // DTO 요청 값 자동 검증 활성화
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,            // DTO에 정의된 값만 허용 (나머지 제거)
            forbidNonWhitelisted: true, // DTO 외 값이 들어오면 에러 발생
            transform: true,            // 요청 값을 DTO 타입으로 자동 변환
        }),
    );


    //항상 이게 맨 마지막
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
