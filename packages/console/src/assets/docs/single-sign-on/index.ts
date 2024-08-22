import { SsoProviderName } from '@logto/schemas';
import { type MDXProps } from 'mdx/types';
import { type ComponentType, type LazyExoticComponent } from 'react';
import { safeLazy } from 'react-safe-lazy';

type GuideComponentType = LazyExoticComponent<ComponentType<MDXProps>>;

const ssoConnectorGuides: Readonly<{ [key in SsoProviderName]?: GuideComponentType }> = {
  [SsoProviderName.SAML]: safeLazy(async () => import('./saml/README.mdx')),
  [SsoProviderName.OIDC]: safeLazy(async () => import('./oidc/README.mdx')),
  [SsoProviderName.AZURE_AD]: safeLazy(async () => import('./azure-ad/README.mdx')),
  [SsoProviderName.GOOGLE_WORKSPACE]: safeLazy(async () => import('./google-workspace/README.mdx')),
  [SsoProviderName.OKTA]: safeLazy(async () => import('./okta/README.mdx')),
  [SsoProviderName.AZURE_AD_OIDC]: safeLazy(async () => import('./azure-oidc/README.mdx')),
};

export default ssoConnectorGuides;
