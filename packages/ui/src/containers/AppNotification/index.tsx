import { useCallback, useContext } from 'react';

import Notification from '@/components/Notification';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

const AppNotification = () => {
  const { experienceSettings, setExperienceSettings } = useContext(PageContext);
  const notification = experienceSettings?.notification;

  const onClose = useCallback(() => {
    // Clear notification
    setExperienceSettings((settings) => {
      if (!settings) {
        return;
      }

      return {
        ...settings,
        notification: undefined,
      };
    });
  }, [setExperienceSettings]);

  if (!notification) {
    return null;
  }

  return (
    <Notification className={styles.appNotification} message={notification} onClose={onClose} />
  );
};

export default AppNotification;
