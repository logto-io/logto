import DynamicT from '@/ds-components/DynamicT';

type Props = {
  prices?: string[];
};

/**
 * @deprecated
 * The unit price is an array of string representing the price in cents.
 * Each string represents the price of a tier.
 * TODO: @xiaoyijun [Pricing] Remove the unit price after the new pricing feature is ready.
 */
function MauUnitPrices({ prices }: Props) {
  if (prices === undefined) {
    return <DynamicT forKey="subscription.quota_table.contact" />;
  }

  return prices.length === 0 ? (
    <div>-</div>
  ) : (
    <div>
      {prices.map((value, index) => (
        <div key={value}>
          <DynamicT forKey="subscription.quota_table.tier" interpolation={{ value: index + 1 }} />
          <DynamicT
            forKey="subscription.quota_table.mau_price"
            interpolation={{ value: Number(value) / 100 }}
          />
        </div>
      ))}
    </div>
  );
}

export default MauUnitPrices;
