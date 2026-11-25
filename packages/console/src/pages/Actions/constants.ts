import { type AdminConsoleKey } from '@logto/phrases';
import { LogtoActionKey } from '@logto/schemas';

import { isDevFeaturesEnabled } from '@/consts/env';

export type ActionCatalogItem = {
  actionType: LogtoActionKey;
  name: AdminConsoleKey;
  description: AdminConsoleKey;
};

export const actionCatalog: readonly ActionCatalogItem[] = Object.freeze([
  {
    actionType: LogtoActionKey.PostFirstFactorVerification,
    name: 'actions.types.post_first_factor_verification.name',
    description: 'actions.types.post_first_factor_verification.description',
  },
  {
    actionType: LogtoActionKey.PostSignIn,
    name: 'actions.types.post_sign_in.name',
    description: 'actions.types.post_sign_in.description',
  },
  // Pre-register action
  ...(isDevFeaturesEnabled
    ? [
        {
          actionType: LogtoActionKey.PreRegister,
          name: 'actions.types.pre_register.name',
          description: 'actions.types.pre_register.description',
        } satisfies ActionCatalogItem,
      ]
    : []),
]);
