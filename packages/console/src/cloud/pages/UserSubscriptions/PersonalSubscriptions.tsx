import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import { useUserSubscriptions } from '@/cloud/hooks/use-user-subscriptions';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import FormCard from '@/components/FormCard';
import ItemPreview from '@/components/ItemPreview';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { formatPeriod } from '@/utils/subscription';

import styles from './index.module.scss';
import {
  formatPriceInterval,
  formatUnitPrice,
  getProductTitleKey,
  getScheduledCancellation,
  statusTagMap,
} from './utils';

function PersonalSubscriptions() {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate } = useUserSubscriptions();
  const isOverdue = data?.some(({ status }) => status === 'past_due' || status === 'unpaid');

  return (
    <FormCard
      title="enterprise_subscription.user_subscriptions.personal_title"
      description="enterprise_subscription.user_subscriptions.personal_description"
    >
      <Table
        hasBorder
        isRowHoverEffectDisabled
        rowGroups={[{ key: 'subscriptions', data }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.message}
        placeholder={<EmptyDataPlaceholder />}
        columns={[
          {
            title: t('enterprise_subscription.subscription.basic_plan_column_title.product'),
            dataIndex: 'id',
            render: ({ product }) => <ItemPreview title={t(getProductTitleKey(product))} />,
          },
          {
            title: t('enterprise_subscription.user_subscriptions.price'),
            dataIndex: 'items',
            render: ({ items }) =>
              items.length === 0
                ? '—'
                : items.map(({ id, quantity, price }) => {
                    const interval = formatPriceInterval(price, i18n.language);
                    return (
                      <div key={id} className={styles.item}>
                        {/* Show the quantity only when it adds information beyond a single unit. */}
                        {(quantity ?? 1) > 1 && `${quantity} × `}
                        {formatUnitPrice(price, i18n.language)}
                        {interval && <span> / {interval}</span>}
                      </div>
                    );
                  }),
          },
          {
            title: t('subscription.billing_history.status_column'),
            dataIndex: 'status',
            render: (subscription) => {
              const scheduled = getScheduledCancellation(subscription);
              return (
                <>
                  <Tag type="state" status={statusTagMap[subscription.status]}>
                    {t(`enterprise_subscription.user_subscriptions.status.${subscription.status}`)}
                  </Tag>
                  {scheduled && (
                    <div className={styles.note}>
                      {t('enterprise_subscription.user_subscriptions.cancel_on', {
                        date: dayjs(scheduled).format('MMM D, YYYY'),
                      })}
                    </div>
                  )}
                </>
              );
            },
          },
          {
            title: t('enterprise_subscription.user_subscriptions.billing_period'),
            dataIndex: 'currentPeriodEnd',
            render: ({ currentPeriodStart, currentPeriodEnd }) =>
              formatPeriod({
                periodStart: currentPeriodStart,
                periodEnd: currentPeriodEnd,
                displayYear: true,
              }),
          },
        ]}
        onRetry={() => {
          void mutate();
        }}
      />
      <p className={styles.note}>
        <DynamicT forKey="enterprise_subscription.user_subscriptions.list_price_note" />
      </p>
      {isOverdue && (
        <InlineNotification className={styles.alert} severity="alert">
          <DynamicT forKey="enterprise_subscription.user_subscriptions.overdue_note" />
        </InlineNotification>
      )}
    </FormCard>
  );
}

export default PersonalSubscriptions;
