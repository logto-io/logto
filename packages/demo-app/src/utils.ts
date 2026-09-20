import { Prompt, UserScope } from '@logto/react';
import { LogtoAcr } from '@logto/schemas';
import { yes } from '@silverhand/essentials';
import { z } from 'zod';

export const isDevFeaturesEnabled =
  import.meta.env.DEV || yes(String(import.meta.env.DEV_FEATURES_ENABLED));

type ToZodObject<T> = z.ZodObject<{
  [K in keyof T]-?: z.ZodType<T[K]>;
}>;

type LocalLogtoConfig = {
  signInExtraParams?: string;
  prompt?: string;
  scope?: string;
  resource?: string;
  appId?: string;
};

const localLogtoConfigGuard = z
  .object({
    signInExtraParams: z.string(),
    prompt: z.string(),
    scope: z.string(),
    resource: z.string(),
    appId: z.string(),
  })
  .partial() satisfies ToZodObject<LocalLogtoConfig>;

type LocalUiConfig = {
  showDevPanel?: boolean;
};

const localUiConfigGuard = z
  .object({
    showDevPanel: z.boolean(),
  })
  .partial() satisfies ToZodObject<LocalUiConfig>;

const stepUpConfigGuard = z.object({
  acrValues: z.string(),
  maxAge: z.string(),
  prompt: z.union([z.nativeEnum(Prompt), z.literal('')]),
});

type Key = 'config' | 'ui' | 'stepUp';

const keyPrefix = 'logto:demo-app:dev:';

type KeyToType = {
  config: LocalLogtoConfig;
  ui: LocalUiConfig;
  stepUp: z.infer<typeof stepUpConfigGuard>;
};

const keyToGuard: Readonly<{
  [K in Key]: z.ZodType<KeyToType[K]>;
}> = Object.freeze({
  config: localLogtoConfigGuard,
  ui: localUiConfigGuard,
  stepUp: stepUpConfigGuard,
});

const keyToDefault = Object.freeze({
  config: {
    prompt: [Prompt.Login, Prompt.Consent].join(' '),
    scope: [UserScope.Organizations, UserScope.OrganizationRoles].join(' '),
  },
  ui: {},
  stepUp: { acrValues: LogtoAcr.Mfa, maxAge: '', prompt: Prompt.Login },
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
