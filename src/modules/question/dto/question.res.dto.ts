export class SearchBotReferenceDto {
	documentId: number;
	title: string;
	summary: string;
	createdBy: string;
	createdAt: Date;
	category?: 'DEV_DOC' | 'MEETING_DOC';
}


export class SearchBotResponseDto {
	// AI 응답
	ragResponse: string;
	// 어떤 문서를 이용해 응답했는지
	references: SearchBotReferenceDto[];
}
