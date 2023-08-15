import { DomainStatus, type Application } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import { conditional } from '@silverhand/essentials';
import { useContext, Suspense } from 'react';

import guides from '@/assets/docs/guides';
import { AppDataContext } from '@/contexts/AppDataProvider';
import Button from '@/ds-components/Button';
import CodeEditor from '@/ds-components/CodeEditor';
import TextLink from '@/ds-components/TextLink';
import useCustomDomain from '@/hooks/use-custom-domain';
import DetailsSummary from '@/mdx-components/DetailsSummary';
import { applyDomain } from '@/utils/domain';

import GuideHeaderV2 from '../GuideHeaderV2';
import StepsSkeleton from '../StepsSkeleton';

import * as styles from './index.module.scss';

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
  const { id: appId, secret: appSecret, name: appName, oidcClientMetadata } = app;

  return (
    <div className={styles.container}>
      <GuideHeaderV2 appName={appName} isCompact={isCompact} onClose={onClose} />
      <div className={styles.content}>
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
            {tenantEndpoint && (
              <GuideComponent
                appId={appId}
                appSecret={appSecret}
                endpoint={
                  isCustomDomainActive
                    ? applyDomain(tenantEndpoint.toString(), customDomain.domain)
                    : tenantEndpoint
                }
                alternativeEndpoint={conditional(isCustomDomainActive && tenantEndpoint)}
                redirectUris={oidcClientMetadata.redirectUris}
                postLogoutRedirectUris={oidcClientMetadata.postLogoutRedirectUris}
                isCompact={isCompact}
              />
            )}
          </Suspense>
        </MDXProvider>
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
