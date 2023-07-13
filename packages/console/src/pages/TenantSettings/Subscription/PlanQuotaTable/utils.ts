import { conditional, conditionalString } from '@silverhand/essentials';

import { type SubscriptionPlanTableData, type SubscriptionPlan } from '@/types/subscriptions';

export const constructPlanTableDataArray = (
  plans: SubscriptionPlan[]
): SubscriptionPlanTableData[] =>
  plans.map((plan) => {
    const { id, name, stripeProducts, quota } = plan;

    return {
      id,
      name,
      table: {
        ...quota,
        basePrice: conditional(
          stripeProducts.find((product) => product.type === 'flat')?.price.unitAmountDecimal
        ),
        mauUnitPrice: stripeProducts
          .filter(({ type }) => type !== 'flat')
          .map(({ price: { unitAmountDecimal } }) => conditionalString(unitAmountDecimal)),
      },
    };
  });
