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
import TextLink from '@/ds-components/TextLink';
import { formatPeriod } from '@/utils/subscription';

import { getConsoleSsoDetailsPath } from '../ConsoleSso/Details/paths';
import { useConsoleSsoConnectors } from '../ConsoleSso/use-console-sso';

import styles from './index.module.scss';
import {
  formatPriceInterval,
  formatUnitPrice,
  getScheduledCancellation,
  statusTagMap,
} from './utils';

function PersonalSubscriptions() {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { data, error, isLoading, mutate } = useUserSubscriptions();
  const hasConsoleSso = data?.some(({ product }) => product === 'console-sso');
  const connectors = useConsoleSsoConnectors(Boolean(hasConsoleSso));

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
            render: ({ product, id }) => (
              <ItemPreview
                title={t(
                  product === 'console-sso'
                    ? 'cloud.console_sso.title'
                    : product === 'self-hosted-license'
                      ? 'cloud.self_hosted_licenses.title'
                      : 'enterprise_subscription.user_subscriptions.other_product'
                )}
                subtitle={id}
              />
            ),
          },
          {
            title: t('enterprise_subscription.user_subscriptions.quantity_price'),
            dataIndex: 'items',
            render: ({ items }) =>
              items.length === 0
                ? '—'
                : items.map(({ id, quantity, price }) => {
                    const interval = formatPriceInterval(price, i18n.language);
                    return (
                      <div key={id} className={styles.item}>
                        {quantity ?? '—'} × {formatUnitPrice(price, i18n.language)}
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
          {
            title: t('enterprise_subscription.user_subscriptions.connectors'),
            dataIndex: 'product',
            render: ({ product, id }) => {
              if (product !== 'console-sso') {
                return '—';
              }
              if (Boolean(connectors.error) || connectors.isLoading || !connectors.data) {
                return '—';
              }
              const associated = connectors.data.filter(
                ({ stripeUserSubscriptionId }) => stripeUserSubscriptionId === id
              );
              return associated.length === 0
                ? t('enterprise_subscription.user_subscriptions.no_connectors')
                : associated.map((connector) => (
                    <div key={connector.id}>
                      <TextLink href={getConsoleSsoDetailsPath(connector.id)}>
                        {connector.branding.displayName ?? connector.name}
                      </TextLink>
                    </div>
                  ));
            },
          },
        ]}
        onRetry={() => {
          void mutate();
        }}
      />
      <p className={styles.note}>
        <DynamicT forKey="enterprise_subscription.user_subscriptions.list_price_note" />
      </p>
      {hasConsoleSso && (
        <>
          {connectors.error && (
            <InlineNotification
              severity="error"
              action="general.retry"
              onClick={() => {
                void connectors.mutate();
              }}
            >
              {connectors.error.message}
            </InlineNotification>
          )}
          <p className={styles.note}>
            <DynamicT forKey="enterprise_subscription.user_subscriptions.proration_note" />
          </p>
          <p className={styles.note}>
            <DynamicT forKey="enterprise_subscription.user_subscriptions.overdue_note" />
          </p>
        </>
      )}
    </FormCard>
  );
}

export default PersonalSubscriptions;
