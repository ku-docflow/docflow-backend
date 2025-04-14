import {Injectable} from "@nestjs/common";
import {QdrantService} from "../qdrant/qdrant.service";
import {QdrantSearchParams} from "../qdrant/qdrant.interface";

@Injectable()
export class QuestionRepository {
    constructor(private readonly qdrant: QdrantService) {
    }

    async getDocsByHybridSearchAndOrgId(query: QdrantSearchParams) {
        return this.qdrant.getHybridSearch(query)
    }
}