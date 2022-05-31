import classNames from 'classnames';
import React from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Card from '@/components/Card';
import { ArrowDown, ArrowUp } from '@/icons/Arrow';

import * as styles from './index.module.scss';
import { NewUsersResponse, TotalUsersResponse } from './types';

const Dashboard = () => {
  const { data: totalData } = useSWR<TotalUsersResponse>('/api/dashboard/users/total');
  const { data: newData } = useSWR<NewUsersResponse>('/api/dashboard/users/new');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isLoading = !totalData || !newData;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('dashboard.title')}</div>
        <div className={styles.subtitle}>{t('dashboard.description')}</div>
      </div>
      {!isLoading && (
        <div className={styles.topBlocks}>
          <Card className={styles.block}>
            <div className={styles.title}>{t('dashboard.total_users')}</div>
            <div className={styles.content}>
              <div className={styles.number}>{totalData.totalUserCount}</div>
            </div>
          </Card>
          <Card className={styles.block}>
            <div className={styles.title}>{t('dashboard.new_users_today')}</div>
            <div className={styles.content}>
              <div className={styles.number}>{newData.today.count}</div>
              <div className={classNames(styles.delta, newData.today.delta < 0 && styles.down)}>
                ({newData.today.delta > 0 && '+'}
                {newData.today.delta}){newData.today.delta > 0 ? <ArrowUp /> : <ArrowDown />}
              </div>
            </div>
          </Card>
          <Card className={styles.block}>
            <div className={styles.title}>{t('dashboard.new_users_7_days')}</div>
            <div className={styles.content}>
              <div className={styles.number}>{newData.last7Days.count}</div>
              <div className={classNames(styles.delta, newData.last7Days.delta < 0 && styles.down)}>
                ({newData.last7Days.delta > 0 && '+'}
                {newData.last7Days.delta})
                {newData.last7Days.delta > 0 ? <ArrowUp /> : <ArrowDown />}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
