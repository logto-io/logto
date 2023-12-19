import DynamicT from '@/ds-components/DynamicT';

import QuotaValueWrapper from './QuotaValueWrapper';

type Props = {
  value?: string;
};

function BasePrice({ value }: Props) {
  if (value === undefined) {
    return <DynamicT forKey="subscription.quota_table.contact" />;
  }

  /**
   * `basePrice` is a string value representing the price in cents, we need to convert the value from cents to dollars.
   */
  return (
    <QuotaValueWrapper>
      <DynamicT
        forKey="subscription.quota_table.monthly_price"
        interpolation={{ value: Number(value) / 100 }}
      />
    </QuotaValueWrapper>
  );
}

export default BasePrice;
