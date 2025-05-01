import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class SemanticSearchRequestDto {
    @IsString()
    @IsNotEmpty()
    query: string;

    @IsNumber()
    @IsNotEmpty()
    chatRoomId: number;
}
