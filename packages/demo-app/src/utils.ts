import { Prompt, UserScope } from '@logto/react';
import { z } from 'zod';

type LocalLogtoConfig = {
  prompt?: string;
  scope?: string;
  resource?: string;
};

const localLogtoConfigGuard = z.object({
  prompt: z.string(),
  scope: z.string(),
  resource: z.string(),
}) satisfies z.ZodType<LocalLogtoConfig>;

type LocalUiConfig = {
  showDevPanel?: boolean;
};

const localUiConfigGuard = z.object({
  showDevPanel: z.boolean(),
}) satisfies z.ZodType<LocalUiConfig>;

type Key = 'config' | 'ui';

const keyPrefix = 'logto:demo-app:dev:';

type KeyToType = {
  config: LocalLogtoConfig;
  ui: LocalUiConfig;
};

const keyToGuard: Readonly<{
  [K in Key]: z.ZodType<KeyToType[K]>;
}> = Object.freeze({
  config: localLogtoConfigGuard,
  ui: localUiConfigGuard,
});

const keyToDefault = Object.freeze({
  config: {
    prompt: [Prompt.Login, Prompt.Consent].join(' '),
    scope: [UserScope.Organizations, UserScope.OrganizationRoles].join(' '),
  },
  ui: {},
} satisfies Record<Key, unknown>);

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const safeZodParse = (guard: z.ZodType<unknown>, value: unknown) => {
  const result = guard.safeParse(value);
  return result.success ? result.data : {};
};

export const getLocalData = <K extends Key>(key: K): KeyToType[K] => {
  const result = keyToGuard[key].safeParse(
    safeJsonParse(localStorage.getItem(`${keyPrefix}${key}`) ?? '')
  );
  return result.success ? result.data : keyToDefault[key];
};

export const setLocalData = (key: Key, value: unknown) => {
  localStorage.setItem(`${keyPrefix}${key}`, JSON.stringify(safeZodParse(keyToGuard[key], value)));
};
