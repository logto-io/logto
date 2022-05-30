import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import Notification from '@/components/Notification';

const AppNotification = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const [isOpen, setIsOpen] = useState(false);

  const onClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return <Notification isOpen={isOpen} message={t('description.demo_message')} onClose={onClose} />;
};

export default AppNotification;
