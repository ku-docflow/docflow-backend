import admin from 'firebase-admin';
import { envs } from './envs';

admin.initializeApp({
	credential: admin.credential.cert({
		projectId: envs.FIREBASE_PROJECT_ID,
		clientEmail: envs.FIREBASE_CLIENT_EMAIL,
		privateKey: envs.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
	}),
});

export { admin };
