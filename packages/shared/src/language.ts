import { z } from 'zod';

export const languageKeys = ['en', 'fr', 'zh-CN', 'tr-TR', 'ko-KR'] as const;
export const languageKeyGuard = z.enum(languageKeys);
export type LanguageKey = z.infer<typeof languageKeyGuard>;
