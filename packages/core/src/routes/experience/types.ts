import type Provider from 'oidc-provider';

export type Interaction = Awaited<ReturnType<Provider['interactionDetails']>>;
