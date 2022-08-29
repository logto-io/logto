import { Application } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import i18next from 'i18next';
import { MDXProps } from 'mdx/types';
import { cloneElement, lazy, LazyExoticComponent, Suspense, useState } from 'react';

import CodeEditor from '@/components/CodeEditor';
import DetailsSummary from '@/mdx-components/DetailsSummary';
import { applicationTypeAndSdkTypeMappings, SupportedSdk } from '@/types/applications';

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
  goWeb: lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/go-web.mdx')),
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
  'go-web_zh-cn': lazy(async () => import('@/assets/docs/tutorial/integrate-sdk/go-web_zh-cn.mdx')),
};

const Guide = ({ app, isCompact, onClose }: Props) => {
  const { id: appId, secret: appSecret, name: appName, type: appType, oidcClientMetadata } = app;
  const sdks = applicationTypeAndSdkTypeMappings[appType];
  const [selectedSdk, setSelectedSdk] = useState<SupportedSdk>(sdks[0]);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);

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
              <a {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            ),
            details: DetailsSummary,
          }}
        >
          <Suspense fallback={<StepsSkeleton />}>
            {GuideComponent && (
              <GuideComponent
                appId={appId}
                appSecret={appSecret}
                endpoint={window.location.origin}
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
