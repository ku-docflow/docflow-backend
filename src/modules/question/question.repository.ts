import {Injectable} from "@nestjs/common";
import {QdrantClient} from "@qdrant/js-client-rest";
import {QdrantSearchParams, QdrantService} from "../qdrant/qdrant.service";

@Injectable()
export class QuestionRepository {
    constructor(private readonly qdrant: QdrantService) {
    }

    async get() {
        const query: QdrantSearchParams = {
            orgId: 1,
            points: [0.4, 0.3],
            limit: 5
        }
        await this.qdrant.get(query)

    }
}