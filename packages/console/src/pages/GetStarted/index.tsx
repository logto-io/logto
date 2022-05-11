import { AdminConsoleKey, I18nKey } from '@logto/phrases';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import cakeIcon from '@/assets/images/cake.svg';
import crabIcon from '@/assets/images/crab.svg';
import drinkIcon from '@/assets/images/drink.svg';
import frogIcon from '@/assets/images/frog.svg';
import grinningFaceIcon from '@/assets/images/grinning-face.svg';
import owlIcon from '@/assets/images/owl.svg';
import Button from '@/components/Button';
import Card from '@/components/Card';
import Spacer from '@/components/Spacer';
import useAdminConsoleConfigs from '@/hooks/use-configs';

import * as styles from './index.module.scss';

const GetStarted = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { updateConfigs } = useAdminConsoleConfigs();
  const navigate = useNavigate();

  const data: Array<{
    title: AdminConsoleKey;
    subtitle: AdminConsoleKey;
    icon: string;
    buttonText: I18nKey;
    onClick: () => void;
  }> = [
    {
      title: 'get_started.card1_title',
      subtitle: 'get_started.card1_subtitle',
      icon: grinningFaceIcon,
      buttonText: 'general.check_out',
      onClick: async () => {
        void updateConfigs({ checkDemo: true });
        window.open('https://fake.demo.com', '_blank');
      },
    },
    {
      title: 'get_started.card2_title',
      subtitle: 'get_started.card2_subtitle',
      icon: cakeIcon,
      buttonText: 'general.create',
      onClick: () => {
        navigate('/applications');
      },
    },
    {
      title: 'get_started.card3_title',
      subtitle: 'get_started.card3_subtitle',
      icon: drinkIcon,
      buttonText: 'general.create',
      onClick: () => {
        navigate('/connectors');
      },
    },
    {
      title: 'get_started.card4_title',
      subtitle: 'get_started.card4_subtitle',
      icon: crabIcon,
      buttonText: 'general.set_up',
      onClick: () => {
        navigate('/connectors/social');
      },
    },
    {
      title: 'get_started.card5_title',
      subtitle: 'get_started.card5_subtitle',
      icon: owlIcon,
      buttonText: 'general.customize',
      onClick: () => {
        navigate('/sign-in-experience');
      },
    },
    {
      title: 'get_started.card6_title',
      subtitle: 'get_started.card6_subtitle',
      icon: frogIcon,
      buttonText: 'general.check_out',
      onClick: () => {
        void updateConfigs({ checkFurtherReadings: true });
        window.open('https://further.readings.com', '_blank');
      },
    },
  ];

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
      {data.map(({ title, subtitle, icon, buttonText, onClick }) => (
        <Card key={title} className={styles.card}>
          <img className={styles.icon} src={icon} />
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
