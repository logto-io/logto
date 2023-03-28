import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import CompleteIndicator from '@/assets/images/task-complete.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import ConfirmModal from '@/components/ConfirmModal';
import PageMeta from '@/components/PageMeta';
import Spacer from '@/components/Spacer';
import useUserPreferences from '@/hooks/use-user-preferences';
import { withAppInsights } from '@/utils/app-insights';

import Skeleton from './components/Skeleton';
import useGetStartedMetadata from './hook';
import * as styles from './index.module.scss';

function GetStarted() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data, isLoading } = useGetStartedMetadata();
  const { update } = useUserPreferences();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const hideGetStarted = async () => {
    if (isUpdating) {
      return;
    }
    setIsUpdating(true);

    try {
      await update({ getStartedHidden: true });
      // Navigate to next menu item
      navigate('/dashboard');
    } finally {
      setIsUpdating(false);
    }
  };

  const showConfirmModalHandler = () => {
    setShowConfirmModal(true);
  };

  const hideConfirmModalHandler = () => {
    setShowConfirmModal(false);
  };

  return (
    <div className={styles.container}>
      <PageMeta titleKey="get_started.page_title" />
      <div className={styles.header}>
        <div className={styles.title}>{t('get_started.title')}</div>
        <div className={styles.subtitle}>
          <span>{t('get_started.subtitle_part1')}</span>
          <Spacer />
          <span>
            {t('get_started.subtitle_part2')}
            <Button
              title="get_started.hide_this"
              type="text"
              size="small"
              className={styles.hideButton}
              onClick={showConfirmModalHandler}
            />
          </span>
        </div>
      </div>
      {isLoading && <Skeleton />}
      {!isLoading &&
        data.map(({ id, title, subtitle, icon: CardIcon, isComplete, buttonText, onClick }) => (
          <Card key={id} className={styles.card}>
            {!isComplete && <CardIcon className={styles.icon} />}
            {isComplete && <CompleteIndicator className={styles.icon} />}
            <div className={styles.wrapper}>
              <div className={styles.title}>{t(title)}</div>
              <div className={styles.subtitle}>{t(subtitle)}</div>
            </div>
            <Button
              className={styles.button}
              type="outline"
              size="large"
              title={buttonText}
              onClick={onClick}
            />
          </Card>
        ))}
      <ConfirmModal
        isOpen={showConfirmModal}
        confirmButtonType="primary"
        confirmButtonText="get_started.hide_this"
        isLoading={isUpdating}
        onConfirm={hideGetStarted}
        onCancel={hideConfirmModalHandler}
      >
        {t('get_started.confirm_message')}
      </ConfirmModal>
    </div>
  );
}

export default withAppInsights(GetStarted);
