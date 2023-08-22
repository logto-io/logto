import { withAppInsights } from '@logto/app-insights/react';
import { useTranslation } from 'react-i18next';

import CompleteIndicator from '@/assets/icons/task-complete.svg';
import PageMeta from '@/components/PageMeta';
import Button from '@/ds-components/Button';
import Card from '@/ds-components/Card';
import DynamicT from '@/ds-components/DynamicT';

import FreePlanNotification from './FreePlanNotification';
import Skeleton from './components/Skeleton';
import useGetStartedMetadata from './hook';
import * as styles from './index.module.scss';

function GetStarted() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, isLoading } = useGetStartedMetadata();

  return (
    <div className={styles.container}>
      <PageMeta titleKey="get_started.page_title" />
      <div className={styles.header}>
        <div className={styles.title}>{t('get_started.title')}</div>
        <div className={styles.subtitle}>
          <span>{t('get_started.subtitle_part1')}</span>
        </div>
      </div>
      {isLoading && <Skeleton />}
      {!isLoading && (
        <>
          <FreePlanNotification />
          {data.map(({ id, title, subtitle, icon: CardIcon, isComplete, buttonText, onClick }) => (
            <Card key={id} className={styles.card}>
              {!isComplete && <CardIcon className={styles.icon} />}
              {isComplete && <CompleteIndicator className={styles.icon} />}
              <div className={styles.wrapper}>
                <div className={styles.title}>
                  <DynamicT forKey={title} />
                </div>
                <div className={styles.subtitle}>
                  <DynamicT forKey={subtitle} />
                </div>
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
        </>
      )}
    </div>
  );
}

export default withAppInsights(GetStarted);
