import {Injectable} from "@nestjs/common";
import {QdrantService} from "../qdrant/qdrant.service";
import {QdrantSearchParams} from "../qdrant/qdrant.interface";
import {QdrantQueryPointEntity} from "./points.entity";

@Injectable()
export class QuestionRepository {
    constructor(private readonly qdrant: QdrantService) {
    }

    async getDocsByHybridSearchAndOrgId(query: QdrantSearchParams):Promise<QdrantQueryPointEntity> {
        return this.qdrant.getHybridSearch(query)
    }
}