import { type userSubscriptionsRouter } from '@logto/cloud/routes';
import { ResponseError } from '@withtyped/client';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import {
  useEnterpriseInvoices,
  useUserSubscriptionInvoices,
} from '@/cloud/hooks/use-user-subscriptions';
import { type LogtoEnterpriseResponse, type UserSubscriptionInvoice } from '@/cloud/types/router';
import EmptyDataPlaceholder from '@/components/EmptyDataPlaceholder';
import FormCard from '@/components/FormCard';
import ItemPreview from '@/components/ItemPreview';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Table from '@/ds-components/Table';
import InvoiceStatusTag from '@/pages/TenantSettings/BillingHistory/InvoiceStatusTag';
import { formatInvoicePeriod } from '@/utils/subscription';

import styles from './index.module.scss';
import { formatCurrencyAmount, getProductTitleKey } from './utils';

const invoicePageSize = 10;

type Invoice = Pick<
  UserSubscriptionInvoice,
  | 'id'
  | 'status'
  | 'createdAt'
  | 'periodStart'
  | 'periodEnd'
  | 'servicePeriodStart'
  | 'servicePeriodEnd'
  | 'amountDue'
  | 'currency'
> &
  Partial<Pick<UserSubscriptionInvoice, 'product'>>;

type InvoiceTableProps = {
  readonly invoices?: Invoice[];
  readonly isLoading: boolean;
  readonly error?: Error;
  readonly hasProduct?: boolean;
  readonly pagination?: { page: number; totalCount?: number; onChange: (page: number) => void };
  readonly onRetry: () => void;
  readonly onOpen: (invoiceId: string) => void;
};

function InvoiceTable({
  invoices,
  isLoading,
  error,
  hasProduct,
  pagination,
  onRetry,
  onOpen,
}: InvoiceTableProps) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  return (
    <Table
      hasBorder
      rowGroups={[{ key: 'invoices', data: invoices }]}
      rowIndexKey="id"
      isLoading={isLoading}
      errorMessage={error?.message}
      placeholder={<EmptyDataPlaceholder />}
      pagination={
        pagination && {
          ...pagination,
          pageSize: invoicePageSize,
        }
      }
      columns={[
        {
          title: t('subscription.billing_history.invoice_column'),
          dataIndex: 'id',
          render: (invoice) => (
            <ItemPreview
              title={formatInvoicePeriod(invoice)}
              subtitle={hasProduct ? t(getProductTitleKey(invoice.product ?? null)) : undefined}
            />
          ),
        },
        {
          title: t('subscription.billing_history.status_column'),
          dataIndex: 'status',
          render: ({ status }) => <InvoiceStatusTag status={status} />,
        },
        {
          title: t('subscription.billing_history.amount_column'),
          dataIndex: 'amountDue',
          render: ({ amountDue, currency }) =>
            formatCurrencyAmount(amountDue, currency, i18n.language),
        },
        {
          title: t('subscription.billing_history.invoice_created_date_column'),
          dataIndex: 'createdAt',
          render: ({ createdAt }) => dayjs(createdAt).format('MMMM DD, YYYY'),
        },
      ]}
      rowClickHandler={({ id }) => {
        onOpen(id);
      }}
      onRetry={onRetry}
    />
  );
}

type Props = {
  readonly enterprise?: Pick<LogtoEnterpriseResponse, 'id'>;
};

/** Personal and Enterprise invoices stay in separate lists, each read from its authorized API. */
function BillingHistory({ enterprise }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useCloudApi({ hideErrorToast: true });
  const subscriptionsApi = useCloudApi<typeof userSubscriptionsRouter>({ hideErrorToast: true });
  const [page, setPage] = useState(1);
  const personal = useUserSubscriptionInvoices(page, invoicePageSize);
  const enterpriseInvoices = useEnterpriseInvoices(enterprise?.id);
  const [linkError, setLinkError] = useState<{ error: unknown; retry: () => void }>();
  const isOpening = useRef(false);

  // Hosted invoice URLs expire, so each open reads a fresh one. The page offers the PDF and receipt.
  const openInvoice = async (readUrl: () => Promise<{ hostedInvoiceUrl: string }>) => {
    if (isOpening.current) {
      return;
    }
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Ignore repeated clicks while reading a link.
    isOpening.current = true;
    setLinkError(undefined);
    try {
      const { hostedInvoiceUrl } = await readUrl();
      window.open(hostedInvoiceUrl, '_blank');
    } catch (error: unknown) {
      setLinkError({
        error,
        retry: () => {
          void openInvoice(readUrl);
        },
      });
    } finally {
      // eslint-disable-next-line @silverhand/fp/no-mutation -- Release the link lock after completion.
      isOpening.current = false;
    }
  };

  const isLinkUnavailable =
    linkError?.error instanceof ResponseError && linkError.error.response.status === 404;

  return (
    <FormCard
      title="enterprise_subscription.user_subscriptions.billing_history_title"
      description="enterprise_subscription.user_subscriptions.billing_history_description"
    >
      {linkError &&
        (isLinkUnavailable ? (
          <InlineNotification severity="alert">
            <DynamicT forKey="enterprise_subscription.user_subscriptions.invoice_link_unavailable" />
          </InlineNotification>
        ) : (
          <InlineNotification severity="error" action="general.retry" onClick={linkError.retry}>
            {linkError.error instanceof Error ? linkError.error.message : String(linkError.error)}
          </InlineNotification>
        ))}
      {enterprise && (
        <FormField title="enterprise_subscription.subscription.enterprise_plan_title">
          <InvoiceTable
            invoices={enterpriseInvoices.data}
            isLoading={enterpriseInvoices.isLoading}
            error={enterpriseInvoices.error}
            onRetry={() => {
              void enterpriseInvoices.mutate();
            }}
            onOpen={(invoiceId) => {
              void openInvoice(async () =>
                api.get(
                  '/api/me/logto-enterprises/:enterpriseId/invoices/:invoiceId/hosted-invoice-url',
                  { params: { enterpriseId: enterprise.id, invoiceId } }
                )
              );
            }}
          />
        </FormField>
      )}
      <FormField title="enterprise_subscription.user_subscriptions.personal_title">
        <InvoiceTable
          hasProduct
          invoices={personal.data?.invoices}
          isLoading={personal.isLoading}
          error={personal.error}
          pagination={{ page, totalCount: personal.data?.totalCount, onChange: setPage }}
          onRetry={() => {
            void personal.mutate();
          }}
          onOpen={(invoiceId) => {
            void openInvoice(async () =>
              subscriptionsApi.get('/api/me/subscriptions/invoices/:invoiceId/hosted-invoice-url', {
                params: { invoiceId },
              })
            );
          }}
        />
        <p className={styles.note}>{t('enterprise_subscription.user_subscriptions.credit_note')}</p>
      </FormField>
    </FormCard>
  );
}

export default BillingHistory;
