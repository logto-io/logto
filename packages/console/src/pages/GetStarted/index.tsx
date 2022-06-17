import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import completeIndicator from '@/assets/images/circle-tick.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Spacer from '@/components/Spacer';
import useConfirmModal from '@/hooks/use-confirm-modal';
import useUserPreferences from '@/hooks/use-user-preferences';

import Skeleton from './components/Skeleton';
import useGetStartedMetadata from './hook';
import * as styles from './index.module.scss';

const GetStarted = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const navigate = useNavigate();
  const { data, isLoading } = useGetStartedMetadata({ checkDemoAppExists: true });
  const { update } = useUserPreferences();

  const { confirm } = useConfirmModal();

  const hideGetStarted = async () => {
    const confirmed = await confirm({
      content: t('get_started.confirm_message'),
      confirmButtonType: 'primary',
      confirmButtonText: 'admin_console.get_started.hide_this',
    });

    if (!confirmed) {
      return;
    }

    void update({ hideGetStarted: true });
    // Navigate to next menu item
    navigate('/dashboard');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('get_started.title')}</div>
        <div className={styles.subtitle}>
          <span>{t('get_started.subtitle_part1')}</span>
          <Spacer />
          <span>
            {t('get_started.subtitle_part2')}
            <span className={styles.hideButton} onClick={hideGetStarted}>
              {t('get_started.hide_this')}
            </span>
          </span>
        </div>
      </div>
      {isLoading && <Skeleton />}
      {!isLoading &&
        data.map(
          ({ id, title, subtitle, icon, isComplete, isHidden, buttonText, onClick }) =>
            !isHidden && (
              <Card key={id} className={styles.card}>
                <img className={styles.icon} src={icon} />
                {isComplete && <img className={styles.completeIndicator} src={completeIndicator} />}
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
            )
        )}
    </div>
  );
};

export default GetStarted;
