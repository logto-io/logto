import { builtInCustomProfileFieldKeys } from '@logto/schemas';

export const isBuiltInCustomProfileFieldKey = (
  key: string
): key is (typeof builtInCustomProfileFieldKeys)[number] => {
  return key in builtInCustomProfileFieldKeys;
};
