import { type AdminConsoleKey } from '@logto/phrases';
import { LogtoInlineHookKey } from '@logto/schemas';

export type InlineHookCatalogItem = {
  hookType: LogtoInlineHookKey;
  name: AdminConsoleKey;
  description: AdminConsoleKey;
};

export const inlineHookCatalog: readonly InlineHookCatalogItem[] = Object.freeze([
  {
    hookType: LogtoInlineHookKey.PostFirstFactorVerification,
    name: 'inline_hooks.hooks.post_first_factor_verification.name',
    description: 'inline_hooks.hooks.post_first_factor_verification.description',
  },
  {
    hookType: LogtoInlineHookKey.PostSignIn,
    name: 'inline_hooks.hooks.post_sign_in.name',
    description: 'inline_hooks.hooks.post_sign_in.description',
  },
]);
