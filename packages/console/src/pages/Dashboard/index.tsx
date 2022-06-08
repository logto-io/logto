import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import useSWR from 'swr';

import Card from '@/components/Card';

import Block from './components/Block';
import * as styles from './index.module.scss';
import { ActiveUsersResponse, NewUsersResponse, TotalUsersResponse } from './types';

const Dashboard = () => {
  const { data: totalData } = useSWR<TotalUsersResponse>('/api/dashboard/users/total');
  const { data: newData } = useSWR<NewUsersResponse>('/api/dashboard/users/new');
  const { data: activeData } = useSWR<ActiveUsersResponse>('/api/dashboard/users/active');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const isLoading = !totalData || !newData || !activeData;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>{t('dashboard.title')}</div>
        <div className={styles.subtitle}>{t('dashboard.description')}</div>
      </div>
      {!isLoading && (
        <>
          <div className={styles.blocks}>
            <Block title="dashboard.total_users" count={totalData.totalUserCount} />
            <Block
              title="dashboard.new_users_today"
              count={newData.today.count}
              delta={newData.today.delta}
            />
            <Block
              title="dashboard.new_users_7_days"
              count={newData.last7Days.count}
              delta={newData.last7Days.delta}
            />
          </div>
          <Card>
            <Block
              title="dashboard.daily_active_users"
              count={activeData.dau.count}
              delta={activeData.dau.delta}
              varient="plain"
            />
            <div className={styles.curve}>
              <ResponsiveContainer>
                <AreaChart
                  data={activeData.dauCurve.map((item) => ({
                    ...item,
                    // Remove "year" for a compact label.
                    date: item.date.replace(/\d{4}-/, ''),
                  }))}
                  width={1100}
                  height={168}
                >
                  <CartesianGrid vertical={false} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#5D34F2"
                    strokeWidth={2}
                    fill="#F2EFFD"
                  />
                  <XAxis dataKey="date" />
                  <YAxis orientation="right" axisLine={false} tickLine={false} />
                  <Tooltip />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.blocks}>
              <Block
                title="dashboard.weekly_active_users"
                count={activeData.wau.count}
                delta={activeData.wau.delta}
                varient="bordered"
              />
              <Block
                title="dashboard.monthly_active_users"
                count={activeData.mau.count}
                delta={activeData.mau.delta}
                varient="bordered"
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;
