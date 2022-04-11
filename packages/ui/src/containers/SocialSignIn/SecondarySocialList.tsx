import { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import SocialIconButton from '@/components/Button/SocialIconButton';
import SocialMoreButton from '@/components/Button/SocialMoreButton';
import useSocial from '@/hooks/use-social-connector';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectors: Array<Pick<ConnectorMetadata, 'id' | 'logo'>>;
};

const SecondarySocialList = ({ className, connectors }: Props) => {
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
          onClick={(id) => {
            void signInWithSocial(id);
          }}
        />
      ))}
      {sampled && <SocialMoreButton className={styles.socialButton} />}
    </div>
  );
};

export default SecondarySocialList;
