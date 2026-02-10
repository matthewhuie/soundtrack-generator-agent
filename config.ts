import { env } from 'node:process';

export class Config {
  MODEL_GEMINI: string = env['GOOGLE_MODEL_GEMINI'] || 'gemini-2.5-flash';
  MODEL_LYRIA: string = env['GOOGLE_MODEL_LYRIA'] || 'lyria-002';
  CLOUD_PROJECT: string = env['GOOGLE_CLOUD_PROJECT'] || 'my_project';
  CLOUD_LOCATION: string = env['GOOGLE_CLOUD_LOCATION'] || 'us-central1';
  GENAI_USE_VERTEXAI: string = env['GOOGLE_GENAI_USE_VERTEXAI'] || 'TRUE';
  API_KEY: string = env['GOOGLE_API_KEY'] || 'GOOGLE_API_KEY';
}

export const config = new Config();
