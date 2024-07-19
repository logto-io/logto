import { createComponent } from '@lit/react';

import { LogtoThemeProvider, LogtoCard, LogtoFormCard, LogtoProfileCard } from './index.js';

export * from './utils/locale.js';

export const createReactComponents = (react: Parameters<typeof createComponent>[0]['react']) => {
  return {
    LogtoFormCard: createComponent({
      tagName: LogtoFormCard.tagName,
      elementClass: LogtoFormCard,
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
  };
};
