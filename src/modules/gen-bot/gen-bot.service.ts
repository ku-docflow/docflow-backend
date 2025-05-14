import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GenBotRequestDto, GenBotResponseDto } from './dto/gen-bot.dto';
import { ChatroomService } from '../chatroom/chatroom.service';
import { AIService } from '../AI/AI.service';
import { Message } from '../chatroom/message.entity';
import { ProcessDocumentRequest, ProcessDocumentResponse } from '../py/dto/pythonApiDto';
import { DocumentService } from '../document/document.service';
import { GenerationBotApi } from '../py/api';

@Injectable()
export class GenBotService {
	constructor(private readonly chatRoomService: ChatroomService, private readonly aiService: AIService, private readonly documentService: DocumentService) {
	}

	async createDocByBot(userId: string, request: GenBotRequestDto): Promise<GenBotResponseDto> {

		const { chatroom_id, first_msg_id, last_msg_id, user_query, topic_id } = request;

		// 1. 조직 ID 확인
		const orgId: number | null = await this.chatRoomService.getOrgIdByChatroomId(chatroom_id);
		// chat context 조회
		const messages: Message[] = await this.chatRoomService.getMessagesBetweenIds(chatroom_id, first_msg_id, last_msg_id);
		// 가공
		const chatContext = Message.formatMessagesWithLabels(messages);
		const finalQuery = await this.aiService.getQuestionByChatContextString(user_query, chatContext);
		// 5. DB에 사전 document ID 생성
		const doc = await this.documentService.createDocument(topic_id, '... 생성 중');

		// python 서버 요청
		// Doc Id 사전 생성
		const now = new Date();
		const payload: ProcessDocumentRequest = {
			documentId: doc.id,
			organizationId: orgId,
			chatContext: finalQuery,
			userId,
			createdBy: userId,
			createdAt: now,
		};
		const api = new GenerationBotApi();
		// 응답 후 DB 저장
		const docForSave: ProcessDocumentResponse = await api.processDocument(payload);
		if (docForSave.statusCode >= 400) {
			throw new InternalServerErrorException('문서 생성 중 에러가 발생했습니다 : ', docForSave.message);
		}
		console.log(docForSave);
		const savedDoc = await this.documentService.updateDocument(docForSave.data.documentId, docForSave.data.document);
		// 7. 응답 반환 (documentId만)
		return { documentId: savedDoc.id };
	}

}
