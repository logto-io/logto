import { type ApplicationResponse } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import classNames from 'classnames';
import { type LazyExoticComponent, Suspense, createContext, useContext } from 'react';

import guides from '@/assets/docs/guides';
import { type GuideMetadata } from '@/assets/docs/guides/types';
import Button from '@/ds-components/Button';
import CodeEditor from '@/ds-components/CodeEditor';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextLink from '@/ds-components/TextLink';
import DetailsSummary from '@/mdx-components/DetailsSummary';
import NotFound from '@/pages/NotFound';

import StepsSkeleton from './StepsSkeleton';
import * as styles from './index.module.scss';

export type GuideContextType = {
  metadata: Readonly<GuideMetadata>;
  Logo?: LazyExoticComponent<SvgComponent>;
  isCompact: boolean;
  app?: ApplicationResponse;
  endpoint?: string;
  redirectUris?: string[];
  postLogoutRedirectUris?: string[];
  sampleUrls?: {
    origin: string;
    callback: string;
  };
  audience?: string;
};

type Props = {
  readonly className?: string;
  readonly guideId: string;
  readonly isEmpty?: boolean;
  readonly isLoading?: boolean;
  readonly onClose: () => void;
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
  audience: '',
});

function Guide({ className, guideId, isEmpty, isLoading, onClose }: Props) {
  const guide = guides.find(({ id }) => id === guideId);
  const GuideComponent = guide?.Component;
  const isApiResourceGuide = guide?.metadata.target === 'API';
  const context = useContext(GuideContext);

  return (
    <>
      <OverlayScrollbar className={classNames(styles.content, className)}>
        {isLoading && <StepsSkeleton />}
        {isEmpty && !guide && <NotFound className={styles.notFound} />}
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
              <TextLink {...props} targetBlank>
                {children}
              </TextLink>
            ),
            details: DetailsSummary,
          }}
        >
          <Suspense fallback={<StepsSkeleton />}>
            {GuideComponent && <GuideComponent {...context} />}
          </Suspense>
        </MDXProvider>
      </OverlayScrollbar>
      {!isApiResourceGuide && (
        <nav className={styles.actionBar}>
          <div className={styles.layout}>
            <Button size="large" title="guide.finish_and_done" type="primary" onClick={onClose} />
          </div>
        </nav>
      )}
    </>
  );
}

export default Guide;
