export class SearchBotReferenceDto {
    documentId: string;
    title: string;
    summary: string;
    createdBy: string;
    createdAt: Date;
    category?: 'DEV_DOC' | 'MEETING_DOC';
}


export class SearchBotResponseDto {
    ragResponse: string;
    references: SearchBotReferenceDto[];
}
