import { LicenseEnv } from '@logto/schemas';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import SkuName from '@/components/SkuName';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import Table from '@/ds-components/Table';
import Tag from '@/ds-components/Tag';
import { type License } from '@/types/license';

import InstallForm from '../InstallForm';
import {
  buildLicenseManagementUrl,
  getLicenseRefusalReasonPhraseKey,
  getLicenseStatus,
  licenseEnvPhraseKeys,
} from '../utils';

import styles from './index.module.scss';

type Props = {
  readonly license: License;
};

function LicenseDetails({ license }: Props) {
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isReplacing, setIsReplacing] = useState(false);
  const status = getLicenseStatus(license);
  const { dateFormatter, dateTimeFormatter } = useMemo(
    () => ({
      dateFormatter: new Intl.DateTimeFormat(i18n.language, { dateStyle: 'medium' }),
      dateTimeFormatter: new Intl.DateTimeFormat(i18n.language, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    }),
    [i18n.language]
  );
  const formattedExpiresAt = dateFormatter.format(new Date(license.expiresAt));
  const formattedGraceEndsAt = dateFormatter.format(new Date(license.graceEndsAt));
  const formattedLastRefreshedAt = dateTimeFormatter.format(new Date(license.lastRefreshedAt));
  const rows = [
    {
      key: 'plan',
      label: t('tenants.license.plan_field'),
      value: <SkuName skuId={license.plan} />,
    },
    {
      key: 'environment',
      label: t('tenants.license.environment_field'),
      value: (
        <Tag
          type="state"
          status={license.env === LicenseEnv.Production ? 'success' : 'info'}
          size="medium"
        >
          <DynamicT forKey={licenseEnvPhraseKeys[license.env]} />
        </Tag>
      ),
    },
    {
      key: 'expiresAt',
      label: t('tenants.license.expires_at_field'),
      value: formattedExpiresAt,
    },
    {
      key: 'installedAt',
      label: t('tenants.license.installed_at_field'),
      value: dateFormatter.format(new Date(license.installedAt)),
    },
    {
      key: 'lastRefreshedAt',
      label: t('tenants.license.last_refreshed_at_field'),
      value: formattedLastRefreshedAt,
    },
    {
      key: 'graceEndsAt',
      label: t('tenants.license.grace_ends_at_field'),
      value: formattedGraceEndsAt,
    },
  ];

  return (
    <>
      {status === 'refresh_required' && (
        <InlineNotification severity="alert">
          {license.refusalReason ? (
            t('tenants.license.refresh_refused_description', {
              reason: t(getLicenseRefusalReasonPhraseKey(license.refusalReason)),
              graceEndsAt: formattedGraceEndsAt,
            })
          ) : (
            <DynamicT
              forKey="tenants.license.refresh_expired_description"
              interpolation={{ expiresAt: formattedExpiresAt, graceEndsAt: formattedGraceEndsAt }}
            />
          )}
        </InlineNotification>
      )}
      {status === 'grace_expired' && (
        <InlineNotification
          severity="error"
          action="tenants.license.get_fresh_key_button"
          href={buildLicenseManagementUrl()}
          hrefTargetBlank="noopener"
        >
          <DynamicT
            forKey="tenants.license.grace_expired_description"
            interpolation={{ graceEndsAt: formattedGraceEndsAt }}
          />
        </InlineNotification>
      )}
      <FormCard
        title="tenants.license.details_title"
        description="tenants.license.details_description"
      >
        <Table
          hasBorder
          isRowHoverEffectDisabled
          rowGroups={[{ key: 'license', data: rows }]}
          rowIndexKey="key"
          columns={[
            {
              title: null,
              dataIndex: 'label',
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
        <div className={styles.replace}>
          {isReplacing ? (
            <InstallForm
              isReplacing
              onCancel={() => {
                setIsReplacing(false);
              }}
              onInstalled={() => {
                setIsReplacing(false);
              }}
            />
          ) : (
            <Button
              type="outline"
              title="tenants.license.replace_button"
              onClick={() => {
                setIsReplacing(true);
              }}
            />
          )}
        </div>
      </FormCard>
    </>
  );
}

export default LicenseDetails;
