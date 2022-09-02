import { ApplicationType } from '@logto/schemas';
import { redirectNativeRegEx, redirectUriRegEx } from '@logto/shared';

export const uriValidator = (value: string, applicationType?: ApplicationType) => {
  try {
    if (applicationType === ApplicationType.Native) {
      return redirectNativeRegEx.test(value);
    }

    return redirectUriRegEx.test(value);
  } catch {
    return false;
  }
};

export const uriOriginValidator = (value: string) => {
  try {
    return new URL(value).origin === value;
  } catch {
    return false;
  }
};
