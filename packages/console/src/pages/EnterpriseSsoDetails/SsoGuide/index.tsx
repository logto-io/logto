import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import classNames from 'classnames';
import { Suspense } from 'react';

import ssoConnectorGuides from '@/assets/docs/single-sign-on';
import SsoConnectorContextProvider from '@/contexts/SsoConnectorContextProvider';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import MdxProvider from '@/mdx-components/MdxProvider';
import NotFound from '@/pages/NotFound';

import styles from './index.module.scss';

type Props = {
  readonly ssoConnector?: SsoConnectorWithProviderConfig;
  readonly className?: string;
};

function SsoGuide({ ssoConnector, className }: Props) {
  if (!ssoConnector) {
    return <NotFound />;
  }

  const { providerName } = ssoConnector;

  const Guide = ssoConnectorGuides[providerName];

  if (!Guide) {
    return <NotFound />;
  }

  return (
    <SsoConnectorContextProvider ssoConnector={ssoConnector}>
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
