export interface ApiResponse<T> {
	data: T;
	message: string;
	statusCode: number;
}

// DTO Interfaces
export interface Reference {
	title: string;
	content: string;
}

export interface SaveDocumentRequest {
	documentId: number;
	organizationId: number;
	content: string;
	userId: string;
	createdBy: string;
	createdAt: Date;
}

export interface SearchDocumentRequest {
	references: Reference[] | string[];
	userQuery: string;
}

export type SearchDocumentResponse = ApiResponse<{
	ragResponse: string;
}>;

export interface ProcessDocumentRequest {
	documentId: number;
	organizationId: number| null;
	chatContext: string;
	userId: string;
	createdBy: string;
	createdAt: Date;
}

export type ProcessDocumentResponse = ApiResponse<{
	documentId: number;
	organizationId: number | null;
	createdAt: Date;
	title: string;
	document: string;
	summary: string;
	userId: string;
	createdBy: string;
	category: string;
}>;
