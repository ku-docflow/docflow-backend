import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class GenBotReqDto {
    @IsString()
    @IsNotEmpty()
    query: string;

    @IsNumber()
    @IsNotEmpty()
    chatRoomId: number;

    @IsNumber()
    @IsNotEmpty()
    startMessageId: number;
}
