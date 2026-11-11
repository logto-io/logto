import { LicenseEnv, type LicenseMonthlyUsage } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { type SelfHostedLicenseDetails } from '@/cloud/types/router';
import FormCard from '@/components/FormCard';
import { usageMetricPhraseKeys } from '@/components/LicenseUsageBanner/license-usage-banner';
import { buildOfficialWebsiteContactPageUrl } from '@/consts/external-links';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { licenseEnvPhraseKeys } from '@/pages/OssTenantSettings/License/utils';
import { formatNumberWithComma } from '@/utils/number';

import styles from './index.module.scss';

const contactUrl = buildOfficialWebsiteContactPageUrl('self-hosted-license-usage');

/** The monthly value a limit is evaluated against, so the table matches the warnings. */
const formatMonthly = ({ lastMonth, monthToDate }: LicenseMonthlyUsage) =>
  formatNumberWithComma(Math.max(lastMonth, monthToDate));

type Props = { readonly license: SelfHostedLicenseDetails };

/** The deployments of a license with the latest usage each one reported, and what is over limit. */
function Usage({
  // Cloud and Console deploy separately, so a Cloud that predates these fields must not break the
  // license page.
  license: { deployments = [], usageWarnings = [] },
}: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }),
    [i18n.language]
  );

  return (
    <>
      {usageWarnings.length > 0 && (
        <InlineNotification
          severity="alert"
          action="general.contact_us_action"
          href={contactUrl}
          hrefTargetBlank="noopener"
        >
          <div>{t('cloud.self_hosted_licenses.usage_warning_description')}</div>
          <ul className={styles.warnings}>
            {usageWarnings.map(({ env, metric, value, limit }) => {
              const metricPhraseKey = usageMetricPhraseKeys[metric];

              return (
                <li key={`${env}:${metric}`}>
                  {t('cloud.self_hosted_licenses.usage_warning_metric', {
                    metric: metricPhraseKey ? t(metricPhraseKey) : metric,
                    env: t(licenseEnvPhraseKeys[env]),
                    value: formatNumberWithComma(value),
                    limit: formatNumberWithComma(limit),
                  })}
                </li>
              );
            })}
          </ul>
          <div>{t('tenants.license.usage_banner_action')}</div>
        </InlineNotification>
      )}
      <FormCard
        title="cloud.self_hosted_licenses.deployments_title"
        description="cloud.self_hosted_licenses.deployments_description"
      >
        <Table
          hasBorder
          isRowHoverEffectDisabled
          rowGroups={[{ key: 'deployments', data: deployments }]}
          rowIndexKey="deploymentId"
          // A Cloud that predates `active` returns no flag, so its rows show as active.
          rowClassName={({ active }) => (active ? undefined : styles.inactive)}
          placeholder={
            <div className={styles.empty}>
              <DynamicT forKey="cloud.self_hosted_licenses.deployments_empty" />
            </div>
          }
          columns={[
            {
              title: t('cloud.self_hosted_licenses.deployment_id'),
              dataIndex: 'deploymentId',
              colSpan: 3,
              className: styles.deploymentId,
              render: ({ deploymentId }) => <span title={deploymentId}>{deploymentId}</span>,
            },
            {
              title: t('tenants.license.environment_field'),
              dataIndex: 'env',
              colSpan: 3,
              render: ({ env }) => (
                <Tag type="state" status={env === LicenseEnv.Production ? 'success' : 'info'}>
                  <DynamicT forKey={licenseEnvPhraseKeys[env]} />
                </Tag>
              ),
            },
            {
              title: t('cloud.self_hosted_licenses.logto_version'),
              dataIndex: 'logtoVersion',
              colSpan: 2,
              render: ({ logtoVersion }) => logtoVersion,
            },
            {
              title: t('cloud.self_hosted_licenses.last_seen'),
              dataIndex: 'lastSeenAt',
              colSpan: 2,
              render: ({ lastSeenAt, active }) => (
                <div className={styles.lastSeen}>
                  {dateFormatter.format(new Date(lastSeenAt))}
                  {!active && (
                    <Tag size="small">
                      <DynamicT forKey="cloud.self_hosted_licenses.inactive" />
                    </Tag>
                  )}
                </div>
              ),
            },
            {
              title: t('tenants.license.usage_metric_mau'),
              dataIndex: 'mau',
              colSpan: 2,
              render: ({ usage }) => (usage ? formatMonthly(usage.mau) : '—'),
            },
            {
              title: t('tenants.license.usage_metric_access_tokens'),
              dataIndex: 'monthlyAccessTokens',
              colSpan: 2,
              render: ({ usage }) => (usage ? formatMonthly(usage.monthlyAccessTokens) : '—'),
            },
          ]}
        />
      </FormCard>
    </>
  );
}

export default Usage;
