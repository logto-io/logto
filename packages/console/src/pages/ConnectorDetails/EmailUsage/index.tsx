import { Theme } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import useSWR from 'swr';

import EmailSentIconDark from '@/assets/icons/email-sent-dark.svg?react';
import EmailSentIconLight from '@/assets/icons/email-sent.svg?react';
import Tip from '@/assets/icons/tip.svg?react';
import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';
import { builtInEmailService } from '@/consts/external-links';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

/**
 * SWR cache key for the per-tenant hosted-email usage endpoint. Exported so the connector test
 * can revalidate it after a send consumes quota.
 */
export const getHostedEmailUsageKey = (tenantId: string) =>
  `/api/tenants/${tenantId}/subscription/hosted-email-usage`;

type UsageWindowProps = {
  readonly windowKey: 'daily' | 'monthly';
  readonly usage: number;
  readonly limit?: number;
};

function UsageWindow({ windowKey, usage, limit }: UsageWindowProps) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isOverLimit = limit !== undefined && usage >= limit;

  return (
    <span>
      <Trans
        components={{ value: <span className={conditional(isOverLimit && styles.overLimit)} /> }}
      >
        {limit === undefined
          ? t(`connector_details.logto_email.hosted_email_usage.${windowKey}_unlimited`, { usage })
          : t(`connector_details.logto_email.hosted_email_usage.${windowKey}`, { usage, limit })}
      </Trans>
    </span>
  );
}

type Props = {
  /** Lifetime count, shown until the hosted-email usage feature ships (and for self-hosted). */
  readonly usage?: number;
  readonly isCompact?: boolean;
};

function EmailUsage({ usage, isCompact }: Props) {
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  const { currentTenantId } = useContext(TenantsContext);
  const cloudApi = useCloudApi({ hideErrorToast: true });

  const isHostedEmailUsageEnabled = isCloud && isDevFeaturesEnabled;
  const { data: windowedUsage } = useSWR(
    isHostedEmailUsageEnabled && currentTenantId && getHostedEmailUsageKey(currentTenantId),
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription/hosted-email-usage', {
        params: { tenantId: currentTenantId },
      })
  );

  const icon = theme === Theme.Light ? <EmailSentIconLight /> : <EmailSentIconDark />;
  const tipPhraseKey = isHostedEmailUsageEnabled
    ? 'connector_details.logto_email.hosted_email_usage.tip'
    : 'connector_details.logto_email.total_email_sent_tip';
  const tipContent = (closeTipHandler: () => void) => (
    <Trans
      components={{
        a: (
          <TextLink
            href={getDocumentationUrl(builtInEmailService)}
            targetBlank="noopener"
            onClick={closeTipHandler}
          />
        ),
      }}
    >
      {t(tipPhraseKey)}
    </Trans>
  );

  if (isHostedEmailUsageEnabled) {
    if (!windowedUsage) {
      return null;
    }

    const { dailyUsage, dailyLimit, periodUsage, periodLimit } = windowedUsage;

    return (
      <div className={styles.container}>
        {icon}
        <UsageWindow windowKey="daily" usage={dailyUsage} limit={dailyLimit ?? undefined} />
        <span className={styles.separator}>·</span>
        <UsageWindow windowKey="monthly" usage={periodUsage} limit={periodLimit ?? undefined} />
        <ToggleTip content={tipContent}>
          <IconButton size="small">
            <Tip />
          </IconButton>
        </ToggleTip>
      </div>
    );
  }

  if (usage === undefined) {
    return null;
  }

  return (
    <div className={styles.container}>
      {icon}
      {isCompact ? (
        usage
      ) : (
        <DynamicT
          forKey="connector_details.logto_email.total_email_sent"
          interpolation={{ value: usage }}
        />
      )}
      <ToggleTip content={tipContent}>
        <IconButton size="small">
          <Tip />
        </IconButton>
      </ToggleTip>
    </div>
  );
}

export default EmailUsage;
