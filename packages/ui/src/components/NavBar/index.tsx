import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import ArrowPrev from '@/assets/icons/arrow-prev.svg';
import usePlatform from '@/hooks/use-platform';

import * as styles from './index.module.scss';

type Props = {
  title?: string;
};

const NavBar = ({ title }: Props) => {
  const navigate = useNavigate();
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { isMobile } = usePlatform();

  return (
    <div className={styles.navBar}>
      <div
        className={styles.backButton}
        onClick={() => {
          navigate(-1);
        }}
      >
        <ArrowPrev />
        {!isMobile && <span>{t('action.nav_back')}</span>}
      </div>

      {title && <div className={styles.title}>{title}</div>}
    </div>
  );
};

export default NavBar;
