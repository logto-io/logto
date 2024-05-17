import { type Truthy } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';
import type { Props as TagProps } from '@/ds-components/Tag';
import { type InvoiceStatus } from '@/types/subscriptions';

type Props = {
  readonly status: InvoiceStatus;
};

type TagStatus = TagProps['status'];

const tagStatusMap: Record<Exclude<Truthy<InvoiceStatus>, 'draft'>, TagStatus> = {
  open: 'alert',
  paid: 'success',
  uncollectible: 'error',
  void: 'info',
};

const invoiceStatusPhraseMap: Record<
  Exclude<Truthy<InvoiceStatus>, 'draft'>,
  TFuncKey<'translation', 'admin_console.subscription.billing_history.invoice_status'>
> = {
  open: 'open',
  paid: 'paid',
  uncollectible: 'uncollectible',
  void: 'void',
};

function InvoiceStatusTag({ status }: Props) {
  if (status === 'draft' || !status) {
    // Don't show tag for draft invoices
    return <span>-</span>;
  }

  return (
    <Tag type="state" status={tagStatusMap[status]}>
      <DynamicT
        forKey={`subscription.billing_history.invoice_status.${invoiceStatusPhraseMap[status]}`}
      />
    </Tag>
  );
}

export default InvoiceStatusTag;
