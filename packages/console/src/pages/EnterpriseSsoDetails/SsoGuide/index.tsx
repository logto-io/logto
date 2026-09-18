import classNames from 'classnames';
import { Suspense } from 'react';

import ssoConnectorGuides from '@/assets/docs/single-sign-on';
import SsoConnectorContextProvider, {
  type SsoGuideData,
} from '@/contexts/SsoConnectorContextProvider';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import MdxProvider from '@/mdx-components/MdxProvider';
import NotFound from '@/pages/NotFound';

import styles from './index.module.scss';

type Props = {
  readonly ssoConnector?: SsoGuideData;
  readonly redirectUri?: string;
  readonly isGlobal?: boolean;
  readonly className?: string;
};

function SsoGuide({ ssoConnector, className, redirectUri, isGlobal }: Props) {
  if (!ssoConnector) {
    return <NotFound />;
  }

  const { providerName } = ssoConnector;

  const Guide = ssoConnectorGuides[providerName];

  if (!Guide) {
    return <NotFound />;
  }

  return (
    <SsoConnectorContextProvider
      ssoConnector={ssoConnector}
      redirectUri={redirectUri}
      isGlobal={isGlobal}
    >
      <OverlayScrollbar className={classNames(styles.content, className)}>
        <MdxProvider>
          <Suspense>
            <Guide />
          </Suspense>
        </MdxProvider>
      </OverlayScrollbar>
    </SsoConnectorContextProvider>
  );
}

export default SsoGuide;
