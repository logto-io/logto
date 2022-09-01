import { languageKeyGuard } from '@logto/shared';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown, { DropdownItem } from '@/components/Dropdown';
import useSocial from '@/hooks/use-social';
import { ConnectorData } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  anchorRef?: React.RefObject<HTMLElement>;
  isOpen: boolean;
  onClose: () => void;
  connectors: ConnectorData[];
};

const SocialSignInDropdown = ({ isOpen, onClose, connectors, anchorRef }: Props) => {
  const {
    i18n: { language },
  } = useTranslation();
  const [contentStyle, setContentStyle] = useState<{ top?: number; left?: number }>();
  const { invokeSocialSignIn, theme } = useSocial();

  const adjustPosition = useCallback(() => {
    if (anchorRef?.current) {
      const { left, top } = anchorRef.current.getBoundingClientRect();

      setContentStyle({
        left,
        top: top - 8,
      });
    }
  }, [anchorRef]);

  return (
    <Dropdown
      isOpen={isOpen}
      className={styles.socialDropDown}
      style={{ content: contentStyle }}
      closeTimeoutMS={100}
      onClose={onClose}
      onAfterOpen={adjustPosition}
      onAfterClose={() => {
        setContentStyle(undefined);
      }}
    >
      {connectors.map((connector) => {
        const { id, name, logo, logoDark } = connector;
        const localName = name[languageKeyGuard.default('en').parse(language)];

        return (
          <DropdownItem
            key={id}
            onClick={() => {
              void invokeSocialSignIn(connector);
              onClose();
            }}
          >
            <img
              src={theme === 'dark' ? logoDark ?? logo : logo}
              alt={id}
              className={styles.socialLogo}
            />
            <span>{localName}</span>
          </DropdownItem>
        );
      })}
    </Dropdown>
  );
};

export default SocialSignInDropdown;
