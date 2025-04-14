import {Module} from '@nestjs/common';
import {QdrantClient} from "@qdrant/js-client-rest";
import {envs} from "../../envs";
import { QdrantService } from './qdrant.service';

@Module({
    providers: [
        {
            provide: QdrantClient,
            useFactory: () => new QdrantClient({host: envs.QDRANT_HOST, port: envs.QDRANT_PORT}),
        },
        QdrantService,
    ],
    exports: [QdrantClient, QdrantService],
})
export class QdrantModule {}
