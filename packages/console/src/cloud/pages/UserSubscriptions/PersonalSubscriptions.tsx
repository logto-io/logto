import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import Tip from '@/assets/icons/tip.svg?react';
import { useUserSubscriptions } from '@/cloud/hooks/use-user-subscriptions';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import FormCard from '@/components/FormCard';
import ItemPreview from '@/components/ItemPreview';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import InlineNotification from '@/ds-components/InlineNotification';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { ToggleTip } from '@/ds-components/Tip';

import ManagePaymentButton from './ManagePaymentButton';
import styles from './index.module.scss';
import {
  formatCurrencyAmount,
  formatPriceInterval,
  formatUnitPrice,
  getNextCharge,
  getProductTitleKey,
  getScheduledCancellation,
  isCurrentSubscription,
  isPaymentOverdue,
} from './utils';

const formatDate = (date: Date) => dayjs(date).format('MMM D, YYYY');

function PersonalSubscriptions() {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate } = useUserSubscriptions();
  const subscriptions = data?.filter((subscription) => isCurrentSubscription(subscription));
  const isOverdue = subscriptions?.some((subscription) => isPaymentOverdue(subscription));

  return (
    <FormCard
      title="enterprise_subscription.user_subscriptions.personal_title"
      description="enterprise_subscription.user_subscriptions.personal_description"
    >
      <Table
        hasBorder
        isRowHoverEffectDisabled
        rowGroups={[{ key: 'subscriptions', data: subscriptions }]}
        rowIndexKey="id"
        isLoading={isLoading}
        errorMessage={error?.message}
        placeholder={<EmptyDataPlaceholder />}
        columns={[
          {
            title: t('enterprise_subscription.subscription.basic_plan_column_title.product'),
            dataIndex: 'id',
            render: (subscription) => {
              const scheduled = getScheduledCancellation(subscription);
              return (
                <ItemPreview
                  title={t(getProductTitleKey(subscription.product))}
                  suffix={
                    isPaymentOverdue(subscription) ? (
                      <Tag type="state" status="error">
                        {t(
                          `enterprise_subscription.user_subscriptions.status.${subscription.status}`
                        )}
                      </Tag>
                    ) : (
                      scheduled && (
                        <Tag type="state" status="alert">
                          {t('enterprise_subscription.user_subscriptions.cancels_on', {
                            date: formatDate(scheduled),
                          })}
                        </Tag>
                      )
                    )
                  }
                />
              );
            },
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
            title: (
              <span className={styles.columnTitle}>
                {t('enterprise_subscription.user_subscriptions.next_charge')}
                <ToggleTip content={<DynamicT forKey="subscription.next_bill_tip" />}>
                  <IconButton size="small">
                    <Tip />
                  </IconButton>
                </ToggleTip>
              </span>
            ),
            dataIndex: 'upcomingInvoice',
            render: (subscription) => {
              const { amount, currency, date, isEnding } = getNextCharge(subscription);
              return (
                <>
                  <div>
                    {amount === undefined
                      ? '—'
                      : formatCurrencyAmount(amount, currency, i18n.language)}
                  </div>
                  <div className={styles.note}>
                    {isEnding
                      ? t('enterprise_subscription.user_subscriptions.ends_on', {
                          date: formatDate(date),
                        })
                      : formatDate(date)}
                  </div>
                </>
              );
            },
          },
          {
            title: null,
            dataIndex: 'action',
            className: styles.action,
            render: ({ id }) => <ManagePaymentButton subscriptionId={id} />,
          },
        ]}
        onRetry={() => {
          void mutate();
        }}
      />
      {isOverdue && (
        <InlineNotification className={styles.alert} severity="alert">
          <DynamicT forKey="enterprise_subscription.user_subscriptions.overdue_note" />
        </InlineNotification>
      )}
    </FormCard>
  );
}

export default PersonalSubscriptions;
