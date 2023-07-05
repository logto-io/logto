import { conditional, conditionalString } from '@silverhand/essentials';

import { type SubscriptionPlanTableData, type SubscriptionPlan } from '@/types/subscriptions';

export const constructPlanTableDataArray = (
  plans: SubscriptionPlan[]
): SubscriptionPlanTableData[] =>
  plans.map((plan) => {
    const { id, name, products, quota } = plan;

    return {
      id,
      name,
      table: {
        ...quota,
        basePrice: conditional(
          products.find((product) => product.type === 'flat')?.price.unitAmountDecimal
        ),
        mauUnitPrice: products
          .filter(({ type }) => type !== 'flat')
          .map(({ price: { unitAmountDecimal } }) => conditionalString(unitAmountDecimal)),
      },
    };
  });
