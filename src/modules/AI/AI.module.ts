import {ClassProvider, Module} from '@nestjs/common';
import {AIApiImpl} from "./api/AI.api.impl";
import {AIService} from "./AI.service";

const AIApi: ClassProvider = {
    provide: 'AIApi',
    useClass: AIApiImpl
}

@Module({
    providers: [
        {
            provide: 'AIApi',
            useClass: AIApiImpl,
        },
        AIService
    ],
    exports: [AIService]
})
export class AIModule {
}
