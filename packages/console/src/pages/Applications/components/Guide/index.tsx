import { DomainStatus, type ApplicationResponse } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useContext, Suspense, createContext, useMemo, type LazyExoticComponent } from 'react';

import guides from '@/assets/docs/guides';
import { type GuideMetadata } from '@/assets/docs/guides/types';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CodeEditor from '@/ds-components/CodeEditor';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextLink from '@/ds-components/TextLink';
import useCustomDomain from '@/hooks/use-custom-domain';
import DetailsSummary from '@/mdx-components/DetailsSummary';
import NotFound from '@/pages/NotFound';

import StepsSkeleton from '../StepsSkeleton';

import * as styles from './index.module.scss';

type GuideContextType = {
  metadata: Readonly<GuideMetadata>;
  Logo?: LazyExoticComponent<SvgComponent>;
  app: ApplicationResponse;
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
  app: {} as ApplicationResponse,
  endpoint: '',
  redirectUris: [],
  postLogoutRedirectUris: [],
  isCompact: false,
  sampleUrls: { origin: '', callback: '' },
});

type Props = {
  className?: string;
  guideId: string;
  app?: ApplicationResponse;
  isCompact?: boolean;
  onClose: () => void;
};

function Guide({ className, guideId, app, isCompact, onClose }: Props) {
  const { tenantEndpoint } = useContext(AppDataContext);
  const { data: customDomain } = useCustomDomain();
  const isCustomDomainActive = customDomain?.status === DomainStatus.Active;
  const guide = guides.find(({ id }) => id === guideId);

  const GuideComponent = guide?.Component;

  const memorizedContext = useMemo(
    () =>
      conditional(
        !!guide &&
          !!app && {
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
          }
      ) satisfies GuideContextType | undefined,
    [guide, app, tenantEndpoint, isCustomDomainActive, isCompact]
  );

  return (
    <>
      <OverlayScrollbar className={classNames(styles.content, className)}>
        {!app && <StepsSkeleton />}
        {!!app && !guide && <NotFound className={styles.notFound} />}
        {memorizedContext && (
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
                {tenantEndpoint && GuideComponent && <GuideComponent {...memorizedContext} />}
              </Suspense>
            </MDXProvider>
          </GuideContext.Provider>
        )}
      </OverlayScrollbar>
      {memorizedContext && (
        <nav className={styles.actionBar}>
          <div className={styles.layout}>
            <Button
              size="large"
              title="applications.guide.finish_and_done"
              type="primary"
              onClick={onClose}
            />
          </div>
        </nav>
      )}
    </>
  );
}

export default Guide;
