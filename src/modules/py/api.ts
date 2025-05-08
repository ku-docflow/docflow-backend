import {envs} from "../../envs";
import {
    ProcessDocumentRequest,
    ProcessDocumentResponse,
    SearchDocumentRequest,
    SearchDocumentResponse
} from "./dto/pythonApiDto";

const API_BASE_URL = envs.API_BASE_URL;


export class SearchBotApi {
    async searchDocument(data: SearchDocumentRequest): Promise<SearchDocumentResponse> {
        const response = await fetch(`${API_BASE_URL}/api/search-document`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
}

export class GenerationBotApi {
    async processDocument(data: ProcessDocumentRequest): Promise<ProcessDocumentResponse> {
        const response = await fetch(`${API_BASE_URL}/api/process-document`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        return response.json();
    }
}