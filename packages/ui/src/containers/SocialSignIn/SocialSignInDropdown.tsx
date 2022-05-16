import { Language } from '@logto/phrases';
import React, { useMemo, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Dropdown, { DropdownItem } from '@/components/Dropdown';
import useSocial from '@/hooks/use-social';
import { ConnectorData } from '@/types';

import * as styles from './SocialSignInDropdown.module.scss';

type Props = {
  anchorRef?: React.RefObject<HTMLElement | SVGSVGElement>;
  isOpen: boolean;
  onClose: () => void;
  connectors: ConnectorData[];
};

const SocialSignInDropdown = ({ isOpen, onClose, connectors, anchorRef }: Props) => {
  const {
    i18n: { language },
  } = useTranslation();

  const { invokeSocialSignIn } = useSocial();

  const [contentStyle, setContentStyle] = useState<{ top?: number; left?: number }>();

  const items = useMemo(
    () =>
      connectors.map(({ id, name, logo }) => {
        const languageKey = Object.keys(name).find((key) => key === language) ?? 'en';
        const localName = name[languageKey as Language];

        return (
          <DropdownItem
            key={id}
            onClick={() => {
              void invokeSocialSignIn(id, onClose);
            }}
          >
            <img src={logo} alt={id} className={styles.socialLogo} />
            <span>{localName}</span>
          </DropdownItem>
        );
      }),
    [connectors, language, invokeSocialSignIn, onClose]
  );

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
      {items}
    </Dropdown>
  );
};

export default SocialSignInDropdown;
