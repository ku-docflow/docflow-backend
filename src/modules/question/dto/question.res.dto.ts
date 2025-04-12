import {SearchBotReferenceDto} from "./question.req.dto";

export class SemanticSearchResultDto {
    documentId: string;
    title: string;
    summary: string;
    createdBy: string;
    createdAt: string; // ISO8601
    category?: 'DEV_DOC' | 'MEETING_DOC';
}


export class SearchBotResponseDto {
    ragResponse: string;
    references: SearchBotReferenceDto[];
}
