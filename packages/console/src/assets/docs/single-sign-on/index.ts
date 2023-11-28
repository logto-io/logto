import { SsoProviderName } from '@logto/schemas';
import { type MDXProps } from 'mdx/types';
import { lazy, type LazyExoticComponent, type FunctionComponent } from 'react';

export type GuideComponentType = LazyExoticComponent<FunctionComponent<MDXProps>>;

const ssoConnectorGuides: Readonly<{ [key in SsoProviderName]?: GuideComponentType }> = {
  [SsoProviderName.SAML]: lazy(async () => import('./SAML/README.mdx')),
  [SsoProviderName.OIDC]: lazy(async () => import('./OIDC/README.mdx')),
};

export default ssoConnectorGuides;
