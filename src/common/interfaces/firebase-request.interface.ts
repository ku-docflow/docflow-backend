import { Request } from 'express';

export interface FirebaseRequest extends Request {
	user: {
		id: string;
		email: string | undefined;
	};
}
