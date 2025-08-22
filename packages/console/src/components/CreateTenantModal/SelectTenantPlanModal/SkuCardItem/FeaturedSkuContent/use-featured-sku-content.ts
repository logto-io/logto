import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { isDevFeaturesEnabled } from '@/consts/env';
import {
  freePlanAuditLogsRetentionDays,
  freePlanM2mLimit,
  freePlanMauLimit,
  freePlanPermissionsLimit,
  freePlanRoleLimit,
  proPlanAuditLogsRetentionDays,
  // eslint-disable-next-line unused-imports/no-unused-imports -- for jsdoc usage
  featuredPlanIds,
} from '@/consts/subscriptions';

type ContentData = {
  readonly title: string;
  readonly isAvailable: boolean;
};

/**
 * This hook is used to build the plan content on the SelectTenantPlanModal.
 * It is used to display the features of the selected plan.
 * Currently, all the feature content is hardcoded.
 * For the grandfathered Pro plan and new created Pro202411 plan, the content is the same.
 * So we don't need to differentiate them. here.
 *
 * @param skuId The selected sku id. Can only be one of {@link featuredPlanIds}
 */
const useFeaturedSkuContent = (skuId: string) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.upsell.featured_plan_content',
  });

  const contentData: ContentData[] = useMemo(() => {
    const isFreePlan = skuId === ReservedPlanId.Free;
    const planPhraseKey = isFreePlan ? 'free_plan' : 'pro_plan';

    return [
      {
        title: t(`mau.${planPhraseKey}`, { ...cond(isFreePlan && { count: freePlanMauLimit }) }),
        isAvailable: true,
      },
      {
        title: t(`m2m.${planPhraseKey}`, { ...cond(isFreePlan && { count: freePlanM2mLimit }) }),
        isAvailable: true,
      },
      {
        title: t(isDevFeaturesEnabled ? 'saml_and_third_party_apps' : 'third_party_apps'),
        isAvailable: !isFreePlan,
      },
      {
        title: t('mfa'),
        isAvailable: !isFreePlan,
      },
      {
        title: t('sso'),
        isAvailable: !isFreePlan,
      },
      {
        title: isDevFeaturesEnabled
          ? t('rbac')
          : t(`role_and_permissions.${planPhraseKey}`, {
              ...cond(
                isFreePlan && {
                  roleCount: freePlanRoleLimit,
                  permissionCount: freePlanPermissionsLimit,
                }
              ),
            }),
        isAvailable: isDevFeaturesEnabled ? !isFreePlan : true,
      },
      {
        title: t('organizations'),
        isAvailable: !isFreePlan,
      },
      {
        title: t('audit_logs', {
          count: isFreePlan ? freePlanAuditLogsRetentionDays : proPlanAuditLogsRetentionDays,
        }),
        isAvailable: true,
      },
    ];
  }, [t, skuId]);

  return contentData;
};

export default useFeaturedSkuContent;
