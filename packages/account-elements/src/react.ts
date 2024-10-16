import { createComponent } from '@lit/react';

import { LogtoAccountProvider } from './index.js';

export const createReactComponents = (react: Parameters<typeof createComponent>[0]['react']) => {
  return {
    LogtoAccountProvider: createComponent({
      tagName: LogtoAccountProvider.tagName,
      elementClass: LogtoAccountProvider,
      react,
    }),
  };
};
