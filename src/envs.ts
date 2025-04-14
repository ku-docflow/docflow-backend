import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
export const envs: DocflowEnv = {
  DB_HOST: process.env['DB_HOST'],
  DB_USER: process.env['DB_USER'],
  DB_PORT: Number(process.env['DB_PORT']),
  DB_PASSWORD: process.env['DB_PASSWORD'],
  DB_NAME: process.env['DB_NAME'],

  FIREBASE_PROJECT_ID: process.env['FIREBASE_PROJECT_ID'],
  FIREBASE_CLIENT_EMAIL: process.env['FIREBASE_CLIENT_EMAIL'],
  FIREBASE_PRIVATE_KEY: process.env['FIREBASE_PRIVATE_KEY'],
  QDRANT_HOST: process.env.QDRANT_HOST ?? 'localhost',
  QDRANT_PORT: Number(process.env.QDRANT_PORT) || 6333,
};

interface DocflowEnv {
  DB_HOST: string | undefined;
  DB_USER: string | undefined;
  DB_PORT: number | undefined;
  DB_PASSWORD: string | undefined;
  DB_NAME: string | undefined;

  FIREBASE_PROJECT_ID: string | undefined;
  FIREBASE_CLIENT_EMAIL: string | undefined;
  FIREBASE_PRIVATE_KEY: string | undefined;

  QDRANT_HOST: string | undefined;
  QDRANT_PORT: number | undefined;
}
