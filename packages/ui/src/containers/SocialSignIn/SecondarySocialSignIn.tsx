import { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import React, { useMemo } from 'react';

import MoreButton from '@/components/Button/MoreButton';
import SocialIconButton from '@/components/Button/SocialIconButton';
import useSocial from '@/hooks/use-social';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectors: Array<Pick<ConnectorMetadata, 'id' | 'logo'>>;
  showMoreConnectors?: () => void;
};

const SecondarySocialSignIn = ({ className, connectors, showMoreConnectors }: Props) => {
  const { invokeSocialSignIn } = useSocial();
  const isOverSize = connectors.length > 4;

  const displayConnectors = useMemo(() => {
    if (isOverSize) {
      return connectors.slice(0, 3);
    }

    return connectors;
  }, [connectors, isOverSize]);

  return (
    <div className={classNames(styles.socialIconList, className)}>
      {displayConnectors.map((connector) => (
        <SocialIconButton
          key={connector.id}
          className={styles.socialButton}
          connector={connector}
          onClick={() => {
            void invokeSocialSignIn(connector.id);
          }}
        />
      ))}
      {isOverSize && <MoreButton className={styles.socialButton} onClick={showMoreConnectors} />}
    </div>
  );
};

export default SecondarySocialSignIn;
