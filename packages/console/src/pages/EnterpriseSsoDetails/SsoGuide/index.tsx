import { type SsoConnectorWithProviderConfig } from '@logto/schemas';
import { MDXProvider } from '@mdx-js/react';
import classNames from 'classnames';
import { Suspense } from 'react';

import ssoConnectorGuides from '@/assets/docs/single-sign-on';
import SsoConnectorContextProvider from '@/contexts/SsoConnectorContextProvider';
import OverlayScrollbar from '@/ds-components/OverlayScrollbar';
import TextLink from '@/ds-components/TextLink';
import NotFound from '@/pages/NotFound';

import * as styles from './index.module.scss';

type Props = {
  ssoConnector?: SsoConnectorWithProviderConfig;
  className?: string;
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
        <MDXProvider
          components={{
            a: ({ children, ...props }) => (
              <TextLink {...props} target="_blank" rel="noopener noreferrer">
                {children}
              </TextLink>
            ),
          }}
        >
          <Suspense>
            <Guide />
          </Suspense>
        </MDXProvider>
      </OverlayScrollbar>
    </SsoConnectorContextProvider>
  );
}

export default SsoGuide;
