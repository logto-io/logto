import type { Nullable } from '@silverhand/essentials';
import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Trans, useTranslation } from 'react-i18next';

import { AppNotification as Notification } from '@/components/Notification';
import usePlatform from '@/hooks/use-platform';
import { searchKeys } from '@/utils/search-parameters';

import * as styles from './index.module.scss';

const AppNotification = () => {
  const { isMobile } = usePlatform();
  const [notification, setNotification] = useState<Nullable<string>>(null);
  const [topOffset, setTopOffset] = useState<number>();
  const eleRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const adjustNotificationPosition = useCallback(() => {
    const mainEleOffsetTop = document.querySelector('main')?.offsetTop;
    const elementHeight = eleRef.current?.offsetHeight;

    if (mainEleOffsetTop !== undefined && elementHeight) {
      const topSpace = mainEleOffsetTop - elementHeight - 24;
      setTopOffset(Math.max(32, topSpace));
    }
  }, []);

  useEffect(() => {
    setNotification(sessionStorage.getItem(searchKeys.notification));
  }, []);

  useEffect(() => {
    if (!notification || isMobile) {
      return;
    }

    adjustNotificationPosition();

    window.addEventListener('resize', adjustNotificationPosition);

    return () => {
      window.removeEventListener('resize', adjustNotificationPosition);
    };
  }, [adjustNotificationPosition, isMobile, notification]);

  const onClose = useCallback(() => {
    setNotification(null);
  }, []);

  if (!notification) {
    return null;
  }

  return createPortal(
    <Notification
      ref={eleRef}
      className={styles.appNotification}
      message={<Trans t={t}>{notification}</Trans>}
      style={isMobile ? undefined : { top: topOffset }}
      onClose={onClose}
    />,
    document.body
  );
};

export default AppNotification;
