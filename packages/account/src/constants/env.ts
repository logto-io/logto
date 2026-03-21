import { yes } from '@silverhand/essentials';

const normalizeEnv = (value: unknown) =>
  value === null || value === undefined ? undefined : String(value);

export const isDevFeaturesEnabled =
  !import.meta.env.PROD || yes(normalizeEnv(Reflect.get(import.meta.env, 'DEV_FEATURES_ENABLED')));
