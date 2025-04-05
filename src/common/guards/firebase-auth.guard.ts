import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { FirebaseRequest } from 'src/common/interfaces/firebase-request.interface';
import { admin } from '../../firebase';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<FirebaseRequest>();
		const authHeader = request.headers.authorization;

		if (!authHeader?.startsWith('Bearer ')) {
			throw new UnauthorizedException('No Firebase ID token found');
		}

		const idToken = authHeader.split('Bearer ')[1];

		try {
			const decodedToken = await admin.auth().verifyIdToken(idToken);
			// TODO: Add more from decodedToken
			request.user = { id: decodedToken.uid, email: decodedToken.email };
			return true;
		} catch (error) {
			throw new UnauthorizedException('Invalid Firebase ID token');
		}
	}
}
