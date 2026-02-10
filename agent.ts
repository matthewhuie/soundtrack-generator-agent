import { FunctionTool, LlmAgent } from '@google/adk';
import { GoogleGenAI } from '@google/genai';
import { writeFile } from 'node:fs/promises';
import { z } from 'zod';
import { PROMPT_DIRECTOR, PROMPT_SCORER, PROMPT_COMPOSER } from './prompts.ts';
import { config } from './config.ts';

const generateSoundtrackTool = new FunctionTool({
  name: 'generate_soundtrack',
  description: 'Generates a music soundtrack based on a musical prompt, using the Lyria model. Saves the generated file to the local disk.',
  parameters: z.object({
    prompt: z.string().describe('The musical prompt that describes the soundtrack to generate.'),
  }),
  execute: async ({ prompt }) => {
    console.log(`🎵 [Tool: generate_soundtrack] Generating soundtrack for: "${prompt}"...`);

    const ai = config.GENAI_USE_VERTEXAI ?
      new GoogleGenAI({
        vertexai: config.GENAI_USE_VERTEXAI,
        project: config.CLOUD_PROJECT,
        location: config.CLOUD_LOCATION,
      }) :
      new GoogleGenAI({
        apiKey: config.API_KEY
      });

    // Workaround (2026-02-09): Using generateImages for Lyria, as it uses the same request/response structure as Imagen
    // TODO: When supported, swap out generateImages with the proper function for text-to-music
    const response = await ai.models.generateImages({
      model: config.MODEL_LYRIA,
      prompt: prompt,
    });

    try {
      const output = response?.generatedImages?.[0]?.image?.imageBytes;
      const filePath = `./generated-soundtrack-${Date.now()}.wav`;

      await writeFile(filePath, Buffer.from(output, 'base64'));
      console.log(`🎵 [Tool: generate_soundtrack] Generated soundtrack saved to "${filePath}"...`);
      return filePath;
    } catch (error) {
      console.error('🎵 [Tool: generate_soundtrack] Error saving generated soundtrack:', error);
    }
  }
});

const scorerAgent = new LlmAgent({
  name: 'Scorer',
  model: config.MODEL_GEMINI,
  description: "Analyze the input video context and creates a highly descriptive music generation prompt.",
  instruction: PROMPT_SCORER,
});

const composerAgent = new LlmAgent({
  name: 'Composer',
  model: config.MODEL_GEMINI,
  description: "Takes a musical prompt and generates a suitable soundtrack.",
  tools: [ generateSoundtrackTool ],
  instruction: PROMPT_COMPOSER,
});

export const directorAgent = new LlmAgent({
  name: 'Director',
  model: config.MODEL_GEMINI,
  subAgents: [scorerAgent, composerAgent],
  description: "Orchestrates the video soundtrack generation process - directing the scoring and composing of soundtrack music.",
  instruction: PROMPT_DIRECTOR,
});
