import { createComponent } from '@lit/react';

import {
  LogtoThemeProvider,
  LogtoCard,
  LogtoFormCard,
  LogtoProfileCard,
  LogtoList,
  LogtoUserProvider,
} from './index.js';

export * from './utils/locale.js';
export * from './utils/api.js';

export const createReactComponents = (react: Parameters<typeof createComponent>[0]['react']) => {
  return {
    LogtoFormCard: createComponent({
      tagName: LogtoFormCard.tagName,
      elementClass: LogtoFormCard,
      react,
    }),
    LogtoList: createComponent({
      tagName: LogtoList.tagName,
      elementClass: LogtoList,
      react,
    }),
    LogtoProfileCard: createComponent({
      tagName: LogtoProfileCard.tagName,
      elementClass: LogtoProfileCard,
      react,
    }),
    LogtoCard: createComponent({
      tagName: LogtoCard.tagName,
      elementClass: LogtoCard,
      react,
    }),
    LogtoThemeProvider: createComponent({
      tagName: LogtoThemeProvider.tagName,
      elementClass: LogtoThemeProvider,
      react,
    }),
    LogtoUserProvider: createComponent({
      tagName: LogtoUserProvider.tagName,
      elementClass: LogtoUserProvider,
      react,
    }),
  };
};
