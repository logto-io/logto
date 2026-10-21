import { LicenseUsageMetric, type LicenseMonthlyUsage } from '@logto/schemas';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import DownloadIcon from '@/assets/icons/download.svg?react';
import FormCard from '@/components/FormCard';
import { buildOfficialWebsiteContactPageUrl } from '@/consts/external-links';
import Button from '@/ds-components/Button';
import InlineNotification from '@/ds-components/InlineNotification';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { type License } from '@/types/license';
import { formatNumberWithComma } from '@/utils/number';

import useExportUsageStatement from '../use-export-usage-statement';
import { formatUsageMonth, getPreviousUsageMonth, getUsageWarning } from '../utils';

import styles from './index.module.scss';

type Props = {
  readonly license: License;
};

type MonthlyUsageProps = {
  readonly usage: LicenseMonthlyUsage;
  /** The current month of the snapshot as `YYYY-MM`. */
  readonly month: string;
  readonly limit?: number;
  readonly isExceeded: boolean;
};

/**
 * The count of a monthly metric: the settled last full month, the month so far, and the limit it
 * is compared with. Both months are shown because a limit is exceeded when either of them is
 * above it.
 */
function MonthlyUsageValue({ usage, month, limit, isExceeded }: MonthlyUsageProps) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.monthlyUsage}>
      <span>
        {t('tenants.license.usage_month_value', {
          month: formatUsageMonth(getPreviousUsageMonth(month), i18n.language),
          value: formatNumberWithComma(usage.lastMonth),
        })}
      </span>
      <span>
        {t('tenants.license.usage_month_to_date_value', {
          month: formatUsageMonth(month, i18n.language),
          value: formatNumberWithComma(usage.monthToDate),
        })}
      </span>
      <span className={styles.limit}>
        {typeof limit === 'number'
          ? t('tenants.license.usage_limit_value', { value: formatNumberWithComma(limit) })
          : t('tenants.license.usage_report_only')}
        {isExceeded && (
          <Tag type="state" status="error">
            {t('tenants.license.usage_over_limit')}
          </Tag>
        )}
      </span>
    </div>
  );
}

/**
 * The usage of this deployment against the limits of its license, plus the export of the usage
 * statement the self-hosted terms ask for.
 *
 * MAU and access tokens are counted locally. Too many production deployments is counted by Logto
 * Cloud and arrives as a warning, so that row only appears when the count is over the limit.
 */
function UsageDetails({ license }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { usage, usageLimits, usageWarnings } = license;
  const { isExporting, exportUsageStatement } = useExportUsageStatement();
  const productionDeploymentsWarning = getUsageWarning(
    usageWarnings,
    LicenseUsageMetric.ProductionDeployments
  );

  const rows = useMemo(() => {
    if (!usage) {
      return [];
    }

    return [
      {
        key: 'mau',
        label: t('tenants.license.usage_mau_field'),
        value: (
          <MonthlyUsageValue
            usage={usage.mau}
            month={usage.month}
            limit={usageLimits?.mau ?? undefined}
            isExceeded={Boolean(getUsageWarning(usageWarnings, LicenseUsageMetric.Mau))}
          />
        ),
      },
      {
        key: 'monthlyAccessTokens',
        label: t('tenants.license.usage_access_tokens_field'),
        value: (
          <MonthlyUsageValue
            usage={usage.monthlyAccessTokens}
            month={usage.month}
            limit={usageLimits?.monthlyAccessTokens ?? undefined}
            isExceeded={Boolean(
              getUsageWarning(usageWarnings, LicenseUsageMetric.MonthlyAccessTokens)
            )}
          />
        ),
      },
      {
        key: 'tenants',
        label: t('tenants.license.usage_tenants_field'),
        value: (
          <div className={styles.monthlyUsage}>
            <span>{formatNumberWithComma(usage.tenants)}</span>
            <span className={styles.limit}>{t('tenants.license.usage_report_only')}</span>
          </div>
        ),
      },
      ...(productionDeploymentsWarning
        ? [
            {
              key: 'productionDeployments',
              label: t('tenants.license.usage_production_deployments_field'),
              value: (
                <div className={styles.monthlyUsage}>
                  <span>{formatNumberWithComma(productionDeploymentsWarning.value)}</span>
                  <span className={styles.limit}>
                    {t('tenants.license.usage_limit_value', {
                      value: formatNumberWithComma(productionDeploymentsWarning.limit),
                    })}
                    <Tag type="state" status="error">
                      {t('tenants.license.usage_over_limit')}
                    </Tag>
                  </span>
                </div>
              ),
            },
          ]
        : []),
    ];
  }, [t, usage, usageLimits, usageWarnings, productionDeploymentsWarning]);

  return (
    <FormCard title="tenants.license.usage_title" description="tenants.license.usage_description">
      {Boolean(usageWarnings?.length) && (
        <InlineNotification
          severity="alert"
          className={styles.warning}
          action="general.contact_us_action"
          href={buildOfficialWebsiteContactPageUrl('self-hosted-license-usage')}
          hrefTargetBlank="noopener"
        >
          {t('tenants.license.usage_banner_description')}
        </InlineNotification>
      )}
      {usage ? (
        <Table
          hasBorder
          isRowHoverEffectDisabled
          rowGroups={[{ key: 'usage', data: rows }]}
          rowIndexKey="key"
          columns={[
            {
              title: null,
              dataIndex: 'label',
              isRowHeader: true,
              render: ({ label }) => label,
            },
            {
              title: null,
              dataIndex: 'value',
              className: styles.value,
              render: ({ value }) => value,
            },
          ]}
        />
      ) : (
        <div className={styles.unavailable}>{t('tenants.license.usage_unavailable')}</div>
      )}
      <div className={styles.statement}>
        <div className={styles.statementDescription}>
          {t('tenants.license.usage_statement_description')}
        </div>
        <Button
          type="outline"
          icon={<DownloadIcon className={styles.downloadIcon} />}
          title="tenants.license.usage_statement_export_button"
          isLoading={isExporting}
          onClick={() => {
            void exportUsageStatement();
          }}
        />
      </div>
    </FormCard>
  );
}

export default UsageDetails;
