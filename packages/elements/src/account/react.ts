import { createComponent } from '@lit/react';

import { LogtoUsername } from './elements/logto-username.js';
import {
  LogtoAccountCenter,
  LogtoAccountProvider,
  LogtoSocialIdentity,
  LogtoUserEmail,
  LogtoUserPassword,
  LogtoUserPhone,
} from './index.js';

export * from './api/index.js';

export const createReactComponents = (react: Parameters<typeof createComponent>[0]['react']) => {
  return {
    LogtoAccountProvider: createComponent({
      tagName: LogtoAccountProvider.tagName,
      elementClass: LogtoAccountProvider,
      react,
    }),
    LogtoUsername: createComponent({
      tagName: LogtoUsername.tagName,
      elementClass: LogtoUsername,
      react,
    }),
    LogtoUserEmail: createComponent({
      tagName: LogtoUserEmail.tagName,
      elementClass: LogtoUserEmail,
      react,
    }),
    LogtoUserPassword: createComponent({
      tagName: LogtoUserPassword.tagName,
      elementClass: LogtoUserPassword,
      react,
    }),
    LogtoUserPhone: createComponent({
      tagName: LogtoUserPhone.tagName,
      elementClass: LogtoUserPhone,
      react,
    }),
    LogtoSocialIdentity: createComponent({
      tagName: LogtoSocialIdentity.tagName,
      elementClass: LogtoSocialIdentity,
      react,
    }),
    LogtoAccountCenter: createComponent({
      tagName: LogtoAccountCenter.tagName,
      elementClass: LogtoAccountCenter,
      react,
    }),
  };
};
