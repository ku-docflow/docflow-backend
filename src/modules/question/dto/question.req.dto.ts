import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class SemanticSearchRequestDto {

	@IsString()
	@IsNotEmpty()
	query: string;

	@IsNumber()
	@IsNotEmpty()
	chatRoomId: number;
}
