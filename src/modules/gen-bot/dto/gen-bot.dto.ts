import {IsNumber, IsString} from 'class-validator';

export class GenBotRequestDto {
    @IsNumber()
    chatroom_id: number;

    @IsNumber()
    first_msg_id: number;

    @IsNumber()
    last_msg_id: number;

    @IsString()
    user_query: string;
}
export class GenBotResponseDto {
    @IsNumber()
    documentId: number;
}