import { DomainStatus, type Application } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import { conditional } from '@silverhand/essentials';
import {
  useContext,
  Suspense,
  createContext,
  useMemo,
  type LazyExoticComponent,
  type ComponentType,
} from 'react';

import guides from '@/assets/docs/guides';
import { type GuideMetadata } from '@/assets/docs/guides/types';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CodeEditor from '@/ds-components/CodeEditor';
import TextLink from '@/ds-components/TextLink';
import useCustomDomain from '@/hooks/use-custom-domain';
import DetailsSummary from '@/mdx-components/DetailsSummary';

import GuideHeaderV2 from '../GuideHeaderV2';
import StepsSkeleton from '../StepsSkeleton';

import * as styles from './index.module.scss';

type GuideContextType = {
  metadata: Readonly<GuideMetadata>;
  Logo?: LazyExoticComponent<ComponentType>;
  app: Application;
  endpoint: string;
  alternativeEndpoint?: string;
  redirectUris: string[];
  postLogoutRedirectUris: string[];
  isCompact: boolean;
};

// eslint-disable-next-line no-restricted-syntax
export const GuideContext = createContext<GuideContextType>({} as GuideContextType);

type Props = {
  app?: Application;
  isCompact?: boolean;
  onClose: () => void;
};

function GuideV2({ app, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { data: customDomain } = useCustomDomain();
  const isCustomDomainActive = customDomain?.status === DomainStatus.Active;
  const guide = guides.find(({ id }) => id === 'spa-react');

  if (!app || !guide) {
    throw new Error('Invalid app or guide');
  }

  const GuideComponent = guide.Component;

  const memorizedContext = useMemo(
    () =>
      ({
        metadata: guide.metadata,
        Logo: guide.Logo,
        app,
        endpoint: tenantEndpoint?.toString() ?? '',
        alternativeEndpoint: conditional(isCustomDomainActive && tenantEndpoint?.toString()),
        redirectUris: app.oidcClientMetadata.redirectUris,
        postLogoutRedirectUris: app.oidcClientMetadata.postLogoutRedirectUris,
        isCompact: Boolean(isCompact),
      }) satisfies GuideContextType,
    [guide, app, tenantEndpoint, isCustomDomainActive, isCompact]
  );

  return (
    <div className={styles.container}>
      <GuideHeaderV2 appName={app.name} isCompact={isCompact} onClose={onClose} />
      <div className={styles.content}>
        <GuideContext.Provider value={memorizedContext}>
          <MDXProvider
            components={{
              code: ({ className, children }) => {
                const [, language] = /language-(\w+)/.exec(String(className ?? '')) ?? [];

                return language ? (
                  <CodeEditor isReadonly language={language} value={String(children).trimEnd()} />
                ) : (
                  <code>{String(children).trimEnd()}</code>
                );
              },
              a: ({ children, ...props }) => (
                <TextLink {...props} target="_blank" rel="noopener noreferrer">
                  {children}
                </TextLink>
              ),
              details: DetailsSummary,
            }}
          >
            <Suspense fallback={<StepsSkeleton />}>
              {tenantEndpoint && <GuideComponent {...memorizedContext} />}
            </Suspense>
          </MDXProvider>
        </GuideContext.Provider>
        <nav className={styles.actionBar}>
          <div className={styles.layout}>
            <Button size="large" title="cloud.sie.finish_and_done" type="primary" />
          </div>
        </nav>
      </div>
    </div>
  );
}

export default GuideV2;
