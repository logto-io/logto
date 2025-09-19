import { type ApplicationResponse } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import classNames from 'classnames';
import {
  type ComponentType,
  type LazyExoticComponent,
  type SVGProps,
  Suspense,
  createContext,
  useContext,
} from 'react';

import { guides } from '@/assets/docs/guides';
import { type GuideMetadata } from '@/assets/docs/guides/types';
import Button from '@/ds-components/Button';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import MdxProvider from '@/mdx-components/MdxProvider';
import { type ApplicationSecretRow } from '@/pages/ApplicationDetails/ApplicationDetailsContent/EndpointsAndCredentials';
import NotFound from '@/pages/NotFound';

import StepsSkeleton from './StepsSkeleton';
import styles from './index.module.scss';

export type GuideContextType = {
  metadata: Readonly<GuideMetadata>;
  Logo?:
    | LazyExoticComponent<ComponentType<SVGProps<SVGSVGElement>>>
    | ((props: { readonly className?: string }) => JSX.Element);
  isCompact: boolean;
  app?: ApplicationResponse;
  secrets?: ApplicationSecretRow[];
  endpoint?: string;
  redirectUris?: string[];
  postLogoutRedirectUris?: string[];
  audience?: string;
  showAppSecret: boolean;
  setShowAppSecret: (show: boolean) => void;
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
  secrets: [],
  endpoint: '',
  redirectUris: [],
  postLogoutRedirectUris: [],
  isCompact: false,
  audience: '',
  showAppSecret: false,
  setShowAppSecret: noop,
});

function Guide({ className, guideId, isEmpty, isLoading, onClose }: Props) {
  const guide = guides.find(({ id }) => id === guideId);
  const GuideComponent = guide?.Component;
  const context = useContext(GuideContext);

  return (
    <>
      <OverlayScrollbar className={classNames(styles.content, className)}>
        {isLoading && <StepsSkeleton />}
        {isEmpty && !guide && <NotFound className={styles.notFound} />}
        <MdxProvider>
          <Suspense fallback={<StepsSkeleton />}>
            {GuideComponent && <GuideComponent {...context} />}
          </Suspense>
        </MdxProvider>
      </OverlayScrollbar>
      <nav className={styles.actionBar}>
        <div className={styles.layout}>
          <Button size="large" title="guide.finish_and_done" type="primary" onClick={onClose} />
        </div>
      </nav>
    </>
  );
}

export default Guide;
