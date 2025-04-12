import {ClassProvider, Module} from '@nestjs/common';
import {AIApiImpl} from "./api/AI.api.impl";
import {AIService} from "./AI.service";

const AIApi: ClassProvider = {
    provide: 'AIApi',
    useClass: AIApiImpl
}

@Module({
    controllers: [],
    providers: [
        AIApi,
        AIService
    ]
})
export class AIModule {
}
