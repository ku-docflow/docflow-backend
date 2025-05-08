import { Mention, MessageType } from "src/modules/chatroom/message.entity";

export class SemanticSearchRequestDto {
	sender_id: string;
	text: string;
	mentions: Mention[];
	type?: MessageType;
	shared_message_id?: number;
	shared_message_sender_id?: string;
}
