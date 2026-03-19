// eslint-disable-next-line import/no-unassigned-import
import 'vite/client';
// eslint-disable-next-line import/no-unassigned-import
import 'vite-plugin-svgr/client';

declare global {
  const __ACCOUNT_IS_PRODUCTION__: boolean;
  const __ACCOUNT_DEV_FEATURES_ENABLED__: string | undefined;
}

export {};
