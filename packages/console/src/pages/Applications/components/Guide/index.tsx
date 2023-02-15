import type { Application } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import type { Optional } from '@silverhand/essentials';
import i18next from 'i18next';
import type { MDXProps } from 'mdx/types';
import type { LazyExoticComponent } from 'react';
import { useContext, cloneElement, lazy, Suspense, useEffect, useState } from 'react';

import CodeEditor from '@/components/CodeEditor';
import TextLink from '@/components/TextLink';
import { AppEndpointsContext } from '@/containers/AppEndpointsProvider';
import DetailsSummary from '@/mdx-components/DetailsSummary';
import type { SupportedSdk } from '@/types/applications';
import { applicationTypeAndSdkTypeMappings } from '@/types/applications';

import GuideHeader from '../GuideHeader';
import SdkSelector from '../SdkSelector';
import StepsSkeleton from '../StepsSkeleton';
import * as styles from './index.module.scss';

type Props = {
  app: Application;
  isCompact?: boolean;
  onClose: () => void;
};

const Guides: Record<string, LazyExoticComponent<(props: MDXProps) => JSX.Element>> = {
  ios: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/ios.mdx')),
  android: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/android.mdx')),
  react: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/react.mdx')),
  vue: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/vue.mdx')),
  vanilla: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/vanilla.mdx')),
  express: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/express.mdx')),
  next: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/next.mdx')),
  go: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/go.mdx')),
  'ios_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/ios_zh-cn.mdx')),
  'android_zh-cn': lazy(
    async () => import('@/assets/docs/tutorial/integrate-sdk/android_zh-cn.mdx')
  ),
  'react_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/react_zh-cn.mdx')),
  'vue_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/vue_zh-cn.mdx')),
  'vanilla_zh-cn': lazy(
    async () => import('@/assets/docs/tutorial/integrate-sdk/vanilla_zh-cn.mdx')
  ),
  'express_zh-cn': lazy(
    async () => import('@/assets/docs/tutorial/integrate-sdk/express_zh-cn.mdx')
  ),
  'next_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/next_zh-cn.mdx')),
  'go_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/go_zh-cn.mdx')),
};

const Guide = ({ app, isCompact, onClose }: Props) => {
  const { id: appId, secret: appSecret, name: appName, type: appType, oidcClientMetadata } = app;
  const sdks = applicationTypeAndSdkTypeMappings[appType];
  const [selectedSdk, setSelectedSdk] = useState<Optional<SupportedSdk>>(sdks[0]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const { userEndpoint } = useContext(AppEndpointsContext);

  // Directly close guide if no SDK available
  useEffect(() => {
    if (!selectedSdk) {
      onClose();
    }
  }, [onClose, selectedSdk]);

  if (!selectedSdk) {
    return null;
  }

  const locale = i18next.language;
  const guideI18nKey = `${selectedSdk}_${locale}`.toLowerCase();
  const GuideComponent = Guides[guideI18nKey] ?? Guides[selectedSdk.toLowerCase()];

  return (
    <div className={styles.container}>
      <GuideHeader
        appName={appName}
        selectedSdk={selectedSdk}
        isCompact={isCompact}
        onClose={onClose}
      />
      <div className={styles.content}>
        {cloneElement(<SdkSelector sdks={sdks} selectedSdk={selectedSdk} />, {
          className: styles.banner,
          isCompact,
          onChange: setSelectedSdk,
          onToggle: () => {
            setActiveStepIndex(0);
          },
        })}
        <MDXProvider
          components={{
            code: ({ className, children }) => {
              const [, language] = /language-(\w+)/.exec(className ?? '') ?? [];

              return language ? (
                <CodeEditor isReadonly language={language} value={String(children)} />
              ) : (
                <code>{String(children)}</code>
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
            {GuideComponent && (
              <GuideComponent
                appId={appId}
                appSecret={appSecret}
                endpoint={userEndpoint}
                redirectUris={oidcClientMetadata.redirectUris}
                postLogoutRedirectUris={oidcClientMetadata.postLogoutRedirectUris}
                activeStepIndex={activeStepIndex}
                isCompact={isCompact}
                onNext={(nextIndex: number) => {
                  setActiveStepIndex(nextIndex);
                }}
                onComplete={onClose}
              />
            )}
          </Suspense>
        </MDXProvider>
      </div>
    </div>
  );
};

export default Guide;
