import { got, HTTPError } from 'got';
import { array, object, string, z } from 'zod';

import koaGuard from '#src/middleware/koa-guard.js';

import type { ManagementApiRouter, RouterInitArgs } from './types.js';

const defaultModel = 'gpt-4.1';

const systemPrompt = `You are MeshX AI, an assistant inside the MeshX admin console.
Give short, step-by-step answers about setting up and operating MeshX and Logto.
If you are not sure about a detail, say so instead of guessing.`;

const messageGuard = object({
  role: z.enum(['user', 'assistant']),
  content: string().min(1).max(8_000),
});

const openAiResponseGuard = object({
  choices: array(
    object({
      message: object({ content: string().nullable() }),
    })
  ).min(1),
});

export default function aiChatRoutes<T extends ManagementApiRouter>(
  ...[router]: RouterInitArgs<T>
) {
  router.post(
    '/ai-chat/completions',
    koaGuard({
      body: object({
        messages: array(messageGuard).min(1).max(40),
      }),
      response: object({
        content: string().optional(),
        error: string().optional(),
      }),
      status: [200, 503],
    }),
    async (ctx, next) => {
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        ctx.status = 503;
        ctx.body = { error: 'ai_chat_not_configured' };

        return next();
      }

      const { messages } = ctx.guard.body;

      const response = await got
        .post(
          `${process.env.OPENAI_API_PROXY_ENDPOINT ?? 'https://api.openai.com/v1'}/chat/completions`,
          {
            headers: { Authorization: `Bearer ${apiKey}` },
            json: {
              model: process.env.OPENAI_MODEL_NAME ?? defaultModel,
              messages: [{ role: 'system', content: systemPrompt }, ...messages],
            },
            timeout: { request: 60_000 },
            responseType: 'json',
          }
        )
        .catch((error: unknown) => {
          if (error instanceof HTTPError) {
            return null;
          }

          throw error;
        });

      const parsed = response && openAiResponseGuard.safeParse(response.body);

      if (!parsed?.success) {
        ctx.status = 503;
        ctx.body = { error: 'ai_chat_unavailable' };

        return next();
      }

      ctx.body = { content: parsed.data.choices[0]?.message.content ?? '' };

      return next();
    }
  );
}
