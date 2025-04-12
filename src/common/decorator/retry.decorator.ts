import { Logger } from '@nestjs/common';

export default function Retry(retryCount = 3, delayMs = 1000) {
    return function (
        _target: any,
        _propertyKey: string,
        descriptor: PropertyDescriptor,
    ) {
        const originalMethod = descriptor.value;
        descriptor.value = async function (...args: any[]) {
            let attempts = 0;
            while (attempts < retryCount) {
                try {
                    return await originalMethod.apply(this, args);
                } catch (error) {
                    attempts++;
                    if (error.status == 429) {
                        const delay = 60000 * attempts; // 30초 * attempts
                        Logger.warn(
                            `429 rate limit 오류 발생, ${delay / 1000}초 대기 후 재시도`,
                        );
                        await new Promise((resolve) => setTimeout(resolve, delay)); //  )
                    }
                    Logger.warn(`재시도 중... (${attempts}/${retryCount})`);
                    if (attempts >= retryCount) {
                        Logger.error(`재시도 실패: ${error.message}`);
                        // 마지막 재시도에서도 실패하면 예외를 던지지 않고 null을 반환 → NestJS 예외 핸들러가 처리할 수 있도록 유도
                        throw null;
                    }
                    await new Promise((resolve) =>
                        setTimeout(resolve, delayMs * attempts),
                    ); // 딜레이 후 재시도
                }
            }
        };
        return descriptor;
    };
}
