import { format } from 'date-fns';
import type { ChangeEventHandler } from 'react';
import { useState } from 'react';
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

import AppError from '@/components/AppError';
import PageMeta from '@/components/PageMeta';
import Card from '@/ds-components/Card';
import TextInput from '@/ds-components/TextInput';
import type { RequestError } from '@/hooks/use-api';

import Block from './components/Block';
import ChartTooltip from './components/ChartTooltip';
import Skeleton from './components/Skeleton';
import styles from './index.module.scss';
import type { ActiveUsersResponse, NewUsersResponse, TotalUsersResponse } from './types';

const tickStyle = {
  fill: 'var(--color-text-secondary)',
  fontSize: 11,
  fontFamily: 'var(--font-family)',
};

const tickFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
  notation: 'compact',
});

function Dashboard() {
  const [date, setDate] = useState<string>(format(Date.now(), 'yyyy-MM-dd'));
  const { data: totalData, error: totalError } = useSWR<TotalUsersResponse, RequestError>(
    'api/dashboard/users/total'
  );
  const { data: newData, error: newError } = useSWR<NewUsersResponse, RequestError>(
    'api/dashboard/users/new'
  );
  const { data: activeData, error: activeError } = useSWR<ActiveUsersResponse, RequestError>(
    `api/dashboard/users/active?date=${date}`
  );
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // Pick an error as the page's error
  const error = totalError ?? newError ?? activeError;
  const isLoading = (!totalData || !newData || !activeData) && !error;

  const handleDateChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setDate(event.target.value);
  };

  return (
    <div className={styles.container}>
      <PageMeta titleKey="dashboard.title" />
      <div className={styles.header}>
        <div className={styles.title}>{t('dashboard.title')}</div>
        <div className={styles.subtitle}>{t('dashboard.description')}</div>
      </div>
      {isLoading && <Skeleton />}
      {error && <AppError errorMessage={error.body?.message} />}
      {!isLoading && totalData && newData && activeData && (
        <>
          <div className={styles.blocks}>
            <Block
              title="dashboard.total_users"
              tip={t('dashboard.total_users_tip')}
              count={totalData.totalUserCount}
            />
            <Block
              title="dashboard.new_users_today"
              tip={t('dashboard.new_users_today_tip')}
              count={newData.today.count}
              delta={newData.today.delta}
            />
            <Block
              title="dashboard.new_users_7_days"
              tip={t('dashboard.new_users_7_days_tip')}
              count={newData.last7Days.count}
              delta={newData.last7Days.delta}
            />
          </div>
          <Card className={styles.activeCard}>
            <Block
              title="dashboard.daily_active_users"
              tip={t('dashboard.daily_active_users_tip')}
              count={activeData.dau.count}
              delta={activeData.dau.delta}
              variant="plain"
            />
            <div className={styles.datePicker}>
              <TextInput type="date" value={date} onChange={handleDateChange} />
            </div>
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
                  <CartesianGrid vertical={false} stroke="var(--color-divider)" />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="var(--color-primary)"
                    strokeWidth={2}
                    fill="var(--color-hover-variant)"
                  />
                  <XAxis dataKey="date" tickLine={false} tick={tickStyle} />
                  <YAxis
                    width={35}
                    axisLine={false}
                    tickLine={false}
                    tick={tickStyle}
                    tickFormatter={(tick) => tickFormatter.format(Number(tick)).toLowerCase()}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-primary' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className={styles.blocks}>
              <Block
                title="dashboard.weekly_active_users"
                tip={t('dashboard.weekly_active_users_tip')}
                count={activeData.wau.count}
                delta={activeData.wau.delta}
                variant="bordered"
              />
              <Block
                title="dashboard.monthly_active_users"
                tip={t('dashboard.monthly_active_users_tip')}
                count={activeData.mau.count}
                delta={activeData.mau.delta}
                variant="bordered"
              />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default Dashboard;
