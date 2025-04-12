import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SemanticSearchRequestDto {
    @IsString()
    @IsNotEmpty()
    query: string;

    @IsString()
    @IsNotEmpty()
    chatRoomId: string;

    @IsOptional()
    @IsNumber()
    recentMinutes?: number;
}
export class SearchBotReferenceDto {
    documentId: string;
    title: string;
    summary: string;
    createdBy: string;
    createdAt: string;
    category?: 'DEV_DOC' | 'MEETING_DOC';
}
