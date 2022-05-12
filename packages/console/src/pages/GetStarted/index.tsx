import React from 'react';
import { useTranslation } from 'react-i18next';

import completeIndicator from '@/assets/images/circle-tick.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Spacer from '@/components/Spacer';

import useGetStartedMetadata from './hook';
import * as styles from './index.module.scss';

const GetStarted = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data } = useGetStartedMetadata();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('get_started.title')}</div>
        <div className={styles.subtitle}>
          <span>{t('get_started.subtitle_part1')}</span>
          <Spacer />
          <span>
            {t('get_started.subtitle_part2')}
            <span className={styles.hideButton}>{t('get_started.hide_this')}</span>
          </span>
        </div>
      </div>
      {data.map(({ id, title, subtitle, icon, isComplete, buttonText, onClick }) => (
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
      ))}
    </div>
  );
};

export default GetStarted;
