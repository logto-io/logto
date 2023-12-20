import { conditional, conditionalString } from '@silverhand/essentials';

import {
  allowedUsersPerOrganizationMap,
  appLogoAndFaviconEnabledMap,
  customCssEnabledMap,
  darkModeEnabledMap,
  emailConnectorsEnabledMap,
  i18nEnabledMap,
  invitationEnabledMap,
  justInTimeProvisioningEnabledMap,
  orgPermissionsLimitMap,
  orgRolesLimitMap,
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
          .slice()
          .sort((productA, productB) => {
            const { price: unitAmountDecimalA } = productA;
            const { price: unitAmountDecimalB } = productB;
            return Number(unitAmountDecimalA) - Number(unitAmountDecimalB);
          })
          .map(({ price: { unitAmountDecimal } }) => conditionalString(unitAmountDecimal)),
        customCssEnabled: customCssEnabledMap[id],
        appLogoAndFaviconEnabled: appLogoAndFaviconEnabledMap[id],
        darkModeEnabled: darkModeEnabledMap[id],
        i18nEnabled: i18nEnabledMap[id],
        passwordSignInEnabled: passwordSignInEnabledMap[id],
        passwordlessSignInEnabled: passwordlessSignInEnabledMap[id],
        emailConnectorsEnabled: emailConnectorsEnabledMap[id],
        smsConnectorsEnabled: smsConnectorsEnabledMap[id],
        userManagementEnabled: userManagementEnabledMap[id],
        allowedUsersPerOrganization: allowedUsersPerOrganizationMap[id],
        invitationEnabled: invitationEnabledMap[id],
        orgRolesLimit: orgRolesLimitMap[id],
        orgPermissionsLimit: orgPermissionsLimitMap[id],
        justInTimeProvisioningEnabled: justInTimeProvisioningEnabledMap[id],
      },
    };
  });
