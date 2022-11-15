import { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AppNotification as Notification } from '@/components/Notification';
import { PageContext } from '@/hooks/use-page-context';
import usePlatform from '@/hooks/use-platform';

import * as styles from './index.module.scss';

const AppNotification = () => {
  const { isMobile } = usePlatform();
  const { experienceSettings } = useContext(PageContext);
  const [notification, setNotification] = useState<string>();
  const [topOffset, setTopOffset] = useState<number>();
  const eleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (experienceSettings?.notification) {
      setNotification(experienceSettings.notification);
    }
  }, [experienceSettings]);

  const adjustNotificationPosition = useCallback(() => {
    const mainEleOffsetTop = document.querySelector('main')?.offsetTop;
    const elementHeight = eleRef.current?.offsetHeight;

    if (mainEleOffsetTop !== undefined && elementHeight) {
      const topSpace = mainEleOffsetTop - elementHeight - 24;
      setTopOffset(Math.max(32, topSpace));
    }
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
    setNotification('');
  }, []);

  if (!notification) {
    return null;
  }

  return createPortal(
    <Notification
      ref={eleRef}
      className={styles.appNotification}
      message={notification}
      style={isMobile ? undefined : { top: topOffset }}
      onClose={onClose}
    />,
    document.body
  );
};

export default AppNotification;
