import fs from 'node:fs/promises';

import { languages, type LanguageTag } from '@logto/language-kit';
import { trySafe } from '@silverhand/essentials';
import { type Got, got, HTTPError } from 'got';
import { HttpsProxyAgent } from 'hpagent';
import { z } from 'zod';

import { getProxy, log } from '../../utils.js';

export const createOpenaiApi = () => {
  const proxy = getProxy();

  return got.extend({
    prefixUrl: 'https://api.openai.com/v1',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ''}`,
    },
    timeout: { request: 300_000 },
    ...(proxy && { agent: { https: new HttpsProxyAgent({ proxy, timeout: 300_000 }) } }),
  });
};

const gptResponseGuard = z.object({
  choices: z
    .object({
      message: z.object({ role: z.string(), content: z.string() }),
      finish_reason: z.string(),
    })
    .array(),
});

export const translate = async (api: Got, languageTag: LanguageTag, filePath: string) => {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const response = await trySafe(
    api
      .post('chat/completions', {
        json: {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: `Given the following code snippet, only translate object values to ${languages[languageTag]}, keep all object keys original, output ts code only: \n \`\`\`ts\n${fileContent}\n\`\`\``,
            },
          ],
        },
      })
      .json(),
    (error) => {
      log.warn(`Error while translating ${filePath}:`, String(error));

      if (error instanceof HTTPError) {
        log.warn(error.response.body);
      }
    }
  );

  if (!response) {
    return;
  }

  const guarded = gptResponseGuard.safeParse(response);

  if (!guarded.success) {
    log.warn(`Error while guarding response for ${filePath}:`, response);

    return;
  }

  const [entity] = guarded.data.choices;

  if (!entity) {
    log.warn(`No choice found in response when translating ${filePath}`);

    return;
  }

  if (entity.finish_reason !== 'stop') {
    log.warn(`Unexpected finish reason ${entity.finish_reason} for ${filePath}`);
  }

  const { content } = entity.message;
  const matched = /```ts\n(.*)```/s.exec(content)?.[1];

  if (!matched) {
    // Treat as pure code
    if (['const ', 'import '].some((prefix) => content.startsWith(prefix))) {
      return content;
    }

    log.warn('No matching code snippet from response:', content);
  }

  return matched;
};
