import { conditional, conditionalString } from '@silverhand/essentials';

import {
  appLogoAndFaviconEnabledMap,
  customCssEnabledMap,
  darkModeEnabledMap,
  emailConnectorsEnabledMap,
  i18nEnabledMap,
  passwordSignInEnabledMap,
  passwordlessSignInEnabledMap,
  smsConnectorsEnabledMap,
  userManagementEnabledMap,
} from '@/consts/plan-quotas';
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
        basePrice:
          conditional(
            stripeProducts.find((product) => product.type === 'flat')?.price.unitAmountDecimal
          ) ?? '0',
        mauUnitPrice: stripeProducts
          .filter(({ type }) => type !== 'flat')
          .map(({ price: { unitAmountDecimal } }) => conditionalString(unitAmountDecimal)),
        customCssEnabled: customCssEnabledMap[name],
        appLogoAndFaviconEnabled: appLogoAndFaviconEnabledMap[name],
        darkModeEnabled: darkModeEnabledMap[name],
        i18nEnabled: i18nEnabledMap[name],
        passwordSignInEnabled: passwordSignInEnabledMap[name],
        passwordlessSignInEnabled: passwordlessSignInEnabledMap[name],
        emailConnectorsEnabled: emailConnectorsEnabledMap[name],
        smsConnectorsEnabled: smsConnectorsEnabledMap[name],
        userManagementEnabled: userManagementEnabledMap[name],
      },
    };
  });
