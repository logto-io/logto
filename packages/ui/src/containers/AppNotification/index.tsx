import { Nullable } from '@silverhand/essentials';
import React, { useState, useEffect, useCallback } from 'react';

import Notification from '@/components/Notification';
import { getAppNotificationInfo, clearAppNotificationInfo } from '@/utils/session-storage';

import * as styles from './index.module.scss';

const AppNotification = () => {
  const [notification, setNotification] = useState<Nullable<string>>(null);

  const onClose = useCallback(() => {
    setNotification(null);
    clearAppNotificationInfo();
  }, []);

  useEffect(() => {
    const notification = getAppNotificationInfo();
    setNotification(notification);
  }, []);

  if (!notification) {
    return null;
  }

  return (
    <Notification className={styles.appNotification} message={notification} onClose={onClose} />
  );
};

export default AppNotification;
