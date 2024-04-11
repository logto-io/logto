import { SsoProviderName } from '@logto/schemas';
import { type MDXProps } from 'mdx/types';
import { lazy, type FunctionComponent, type LazyExoticComponent } from 'react';

type GuideComponentType = LazyExoticComponent<FunctionComponent<MDXProps>>;

const ssoConnectorGuides: Readonly<{ [key in SsoProviderName]?: GuideComponentType }> = {
  [SsoProviderName.SAML]: lazy(async () => import('./saml/README.mdx')),
  [SsoProviderName.OIDC]: lazy(async () => import('./oidc/README.mdx')),
  [SsoProviderName.AZURE_AD]: lazy(async () => import('./azure-ad/README.mdx')),
  [SsoProviderName.GOOGLE_WORKSPACE]: lazy(async () => import('./google-workspace/README.mdx')),
  [SsoProviderName.OKTA]: lazy(async () => import('./okta/README.mdx')),
  [SsoProviderName.AZURE_AD_OIDC]: lazy(async () => import('./azure-oidc/README.mdx')),
};

export default ssoConnectorGuides;
