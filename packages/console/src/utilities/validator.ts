import { ApplicationType } from '@logto/schemas';
import { redirectUriRegEx, redirectNativeRegEx } from '@logto/shared';

export const uriValidator = (value: string, applicationType?: ApplicationType) => {
  if (applicationType === ApplicationType.Native) {
    return redirectUriRegEx.test(value);
  }

  return redirectNativeRegEx.test(value);
};

export const uriOriginValidator = (value: string) => {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
};
