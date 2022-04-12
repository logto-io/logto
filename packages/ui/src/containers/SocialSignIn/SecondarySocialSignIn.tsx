import { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import MoreButton from '@/components/Button/MoreButton';
import SocialIconButton from '@/components/Button/SocialIconButton';
import useSocial from '@/hooks/use-social-connector';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectors: Array<Pick<ConnectorMetadata, 'id' | 'logo'>>;
};

const SecondarySocialSignIn = ({ className, connectors }: Props) => {
  const { signInWithSocial } = useSocial();
  const sampled = connectors.length > 4;

  const sampledConnectors = useMemo(() => {
    // TODO: filter with native returned

    if (sampled) {
      return connectors.slice(0, 3);
    }

    return connectors;
  }, [connectors, sampled]);

  return (
    <div className={classNames(styles.socialIconList, className)}>
      {sampledConnectors.map((connector) => (
        <SocialIconButton
          key={connector.id}
          className={styles.socialButton}
          connector={connector}
          onClick={() => {
            void signInWithSocial(connector.id);
          }}
        />
      ))}
      {sampled && <MoreButton className={styles.socialButton} />}
    </div>
  );
};

export default SecondarySocialSignIn;
