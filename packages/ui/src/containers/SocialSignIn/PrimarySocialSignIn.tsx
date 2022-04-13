import { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import React, { useState, useMemo } from 'react';

import SocialLinkButton from '@/components/Button/SocialLinkButton';
import { ExportMoreIcon } from '@/components/Icons';
import useSocial from '@/hooks/use-social-connector';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectors: Array<Pick<ConnectorMetadata, 'id' | 'logo' | 'name'>>;
  isPopup?: boolean;
};

const PrimarySocialSignIn = ({ className, connectors, isPopup = false }: Props) => {
  const [showAll, setShowAll] = useState(false);
  const { invokeSocialSignIn } = useSocial();
  const isOverSize = connectors.length > 3;
  const displayAll = showAll || isPopup || !isOverSize;

  const displayConnectors = useMemo(() => {
    if (displayAll) {
      return connectors;
    }

    return connectors.slice(0, 3);
  }, [connectors, displayAll]);

  return (
    <div className={classNames(styles.socialLinkList, className)}>
      {displayConnectors.map((connector) => (
        <SocialLinkButton
          key={connector.id}
          className={styles.socialLinkButton}
          connector={connector}
          onClick={() => {
            void invokeSocialSignIn(connector.id);
          }}
        />
      ))}
      {!displayAll && (
        <ExportMoreIcon
          className={styles.expandButton}
          onClick={() => {
            setShowAll(true);
          }}
        />
      )}
    </div>
  );
};

export default PrimarySocialSignIn;
