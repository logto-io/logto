import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

type ContentData = {
  title: string;
  isAvailable: boolean;
};

const useFeaturedPlanContent = (planId: string) => {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.upsell.featured_plan_content',
  });

  const contentData: ContentData[] = useMemo(() => {
    const isFreePlan = planId === ReservedPlanId.Free;
    const planPhraseKey = isFreePlan ? 'free_plan' : 'pro_plan';

    return [
      {
        title: t(`mau.${planPhraseKey}`, { ...cond(isFreePlan && { count: 50_000 }) }),
        isAvailable: true,
      },
      {
        title: t(`m2m.${planPhraseKey}`, { ...cond(isFreePlan && { count: 1 }) }),
        isAvailable: true,
      },
      {
        title: t('third_party_apps'),
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
        title: t(`role_and_permissions.${planPhraseKey}`, {
          ...cond(
            isFreePlan && {
              roleCount: 1,
              permissionCount: 1,
            }
          ),
        }),
        isAvailable: true,
      },
      {
        title: t('organizations'),
        isAvailable: !isFreePlan,
      },
      {
        title: t('audit_logs', { count: isFreePlan ? 3 : 14 }),
        isAvailable: true,
      },
    ];
  }, [t, planId]);

  return contentData;
};

export default useFeaturedPlanContent;
