import { DomainStatus, type Application } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
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

import GuideHeader from '../GuideHeader';
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
  sampleUrls: {
    origin: string;
    callback: string;
  };
};

export const GuideContext = createContext<GuideContextType>({
  // The following `as` is for context initialization, they won't be used in production except for
  // HMR.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-syntax
  metadata: {} as GuideMetadata,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, no-restricted-syntax
  app: {} as Application,
  endpoint: '',
  redirectUris: [],
  postLogoutRedirectUris: [],
  isCompact: false,
  sampleUrls: { origin: '', callback: '' },
});

type Props = {
  className?: string;
  guideId: string;
  app?: Application;
  isCompact?: boolean;
  onClose: () => void;
};

function Guide({ className, guideId, app, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { data: customDomain } = useCustomDomain();
  const isCustomDomainActive = customDomain?.status === DomainStatus.Active;
  const guide = guides.find(({ id }) => id === guideId);

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
        sampleUrls: {
          origin: 'http://localhost:3001/',
          callback: 'http://localhost:3001/callback',
        },
      }) satisfies GuideContextType,
    [guide, app, tenantEndpoint, isCustomDomainActive, isCompact]
  );

  return (
    <div className={classNames(styles.container, className)}>
      {!isCompact && <GuideHeader onClose={onClose} />}
      <div className={styles.content}>
        <GuideContext.Provider value={memorizedContext}>
          <MDXProvider
            components={{
              code: ({ className, children }) => {
                const [, language] = /language-(\w+)/.exec(String(className ?? '')) ?? [];

                return language ? (
                  <CodeEditor
                    isReadonly
                    // We need to transform `ts` to `typescript` for prismjs, and
                    // it's weird since it worked in the original Guide component.
                    // To be investigated.
                    language={language === 'ts' ? 'typescript' : language}
                    value={String(children).trimEnd()}
                  />
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
        {!isCompact && (
          <nav className={styles.actionBar}>
            <div className={styles.layout}>
              <Button size="large" title="applications.guide.finish_and_done" type="primary" />
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

export default Guide;
