import { redirectUriRegEx } from '@logto/shared';

export const uriValidator = (value: string) => {
  try {
    redirectUriRegEx.test(value);
  } catch {
    return false;
  }

  return true;
};

export const uriOriginValidator = (value: string) => {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
};
