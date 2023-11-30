import { SsoProviderName } from '@logto/schemas';
import { type MDXProps } from 'mdx/types';
import { lazy, type LazyExoticComponent, type FunctionComponent } from 'react';

type GuideComponentType = LazyExoticComponent<FunctionComponent<MDXProps>>;

const ssoConnectorGuides: Readonly<{ [key in SsoProviderName]?: GuideComponentType }> = {
  [SsoProviderName.SAML]: lazy(async () => import('./SAML/README.mdx')),
  [SsoProviderName.OIDC]: lazy(async () => import('./OIDC/README.mdx')),
  [SsoProviderName.AZURE_AD]: lazy(async () => import('./AzureAD/README.mdx')),
  [SsoProviderName.GOOGLE_WORKSPACE]: lazy(async () => import('./GoogleWorkspace/README.mdx')),
  [SsoProviderName.OKTA]: lazy(async () => import('./Okta/README.mdx')),
};

export default ssoConnectorGuides;
