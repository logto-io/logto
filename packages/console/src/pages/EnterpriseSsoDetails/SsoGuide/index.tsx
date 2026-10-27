import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import classNames from 'classnames';
import { Suspense } from 'react';

import ssoConnectorGuides from '@/assets/docs/single-sign-on';
import { type ConsoleSsoConnector } from '@/cloud/types/router';
import SsoConnectorContextProvider from '@/contexts/SsoConnectorContextProvider';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import MdxProvider from '@/mdx-components/MdxProvider';
import NotFound from '@/pages/NotFound';

import styles from './index.module.scss';

type Props = {
  readonly ssoConnector?: SsoConnectorWithProviderConfig;
  /** Renders the guide for a Console SSO connector instead of a tenant SSO connector. */
  readonly consoleSsoConnector?: ConsoleSsoConnector;
  readonly className?: string;
};

function SsoGuide({ ssoConnector, consoleSsoConnector, className }: Props) {
  const providerName = consoleSsoConnector?.providerName ?? ssoConnector?.providerName;

  if (!providerName) {
    return <NotFound />;
  }

  const Guide = ssoConnectorGuides[providerName];

  if (!Guide) {
    return <NotFound />;
  }

  return (
    <SsoConnectorContextProvider
      ssoConnector={ssoConnector}
      consoleSsoConnector={consoleSsoConnector}
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
