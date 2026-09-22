import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { type BillingCustomer } from '@/cloud/types/router';
import FormField from '@/ds-components/FormField';
import Select from '@/ds-components/Select';

import styles from './index.module.scss';
import { newBillingCustomer } from './utils';

type Props = {
  readonly customers: readonly BillingCustomer[];
  readonly defaultValue: string;
  readonly onChange: (value: string) => void;
};

const customerTitle = ({ customerId, name, email }: BillingCustomer) =>
  [name, email].filter(Boolean).join(' · ') || customerId;

function BillingCustomerPicker({ customers, defaultValue, onChange }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.subscription.billing_customer_modal',
  });
  const [value, setValue] = useState(defaultValue);

  const options = [
    ...customers.map((customer) => ({
      value: customer.customerId,
      title: customerTitle(customer),
    })),
    { value: newBillingCustomer, title: t('new_account') },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.description}>{t('description')}</div>
      <FormField title="subscription.billing_customer_modal.account">
        <Select
          value={value}
          options={options}
          onChange={(next) => {
            if (next) {
              setValue(next);
              onChange(next);
            }
          }}
        />
      </FormField>
    </div>
  );
}

export default BillingCustomerPicker;
