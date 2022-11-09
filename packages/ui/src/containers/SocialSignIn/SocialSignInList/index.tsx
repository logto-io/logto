import type { ConnectorMetadata } from '@logto/schemas';
import classNames from 'classnames';
import { useState, useMemo } from 'react';

import ExpandIcon from '@/assets/icons/expand-icon.svg';
import IconButton from '@/components/Button/IconButton';
import SocialLinkButton from '@/components/Button/SocialLinkButton';
import useSocial from '@/hooks/use-social';
import { getLogoUrl } from '@/utils/logo';

import * as styles from './index.module.scss';

export const defaultSize = 4;

type Props = {
  className?: string;
  socialConnectors?: ConnectorMetadata[];
  isCollapseEnabled?: boolean;
};

const SocialSignInList = ({ className, socialConnectors = [], isCollapseEnabled }: Props) => {
  const [expand, setExpand] = useState(false);
  const { invokeSocialSignIn, theme } = useSocial();
  const isOverSize = socialConnectors.length > defaultSize;
  const displayAll = !isOverSize || !isCollapseEnabled;

  const displayConnectors = useMemo(() => {
    if (displayAll || expand) {
      return socialConnectors;
    }

    return socialConnectors.slice(0, defaultSize);
  }, [displayAll, expand, socialConnectors]);

  return (
    <div className={classNames(styles.socialLinkList, className)}>
      {displayConnectors.map((connector) => {
        const { id, name, logo: logoUrl, logoDark: darkLogoUrl, target } = connector;

        return (
          <SocialLinkButton
            key={id}
            className={styles.socialLinkButton}
            name={name}
            logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
            target={target}
            onClick={() => {
              void invokeSocialSignIn(connector);
            }}
          />
        );
      })}
      {!displayAll && (
        <IconButton
          className={classNames(styles.expandIcon, expand && styles.expanded)}
          onClick={() => {
            setExpand(!expand);
          }}
        >
          <ExpandIcon />
        </IconButton>
      )}
    </div>
  );
};

export default SocialSignInList;
