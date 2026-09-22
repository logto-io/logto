import { LicenseEnv } from '@logto/schemas';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import SkuName from '@/components/SkuName';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
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
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isReplacing, setIsReplacing] = useState(false);
  const status = getLicenseStatus(license);
  const formattedExpiresAt = dayjs(license.expiresAt).format('MMM D, YYYY');
  const formattedGraceEndsAt = dayjs(license.graceEndsAt).format('MMM D, YYYY');
  const formattedLastRefreshedAt = dayjs(license.lastRefreshedAt).format('MMM D, YYYY, h:mm A');

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
        <FormField title="tenants.license.plan_field">
          <div className={styles.value}>
            <SkuName skuId={license.plan} />
          </div>
        </FormField>
        <FormField title="tenants.license.environment_field">
          <div>
            <Tag
              type="state"
              status={license.env === LicenseEnv.Production ? 'success' : 'info'}
              size="medium"
            >
              <DynamicT forKey={licenseEnvPhraseKeys[license.env]} />
            </Tag>
          </div>
        </FormField>
        <FormField title="tenants.license.expires_at_field">
          <div className={styles.value}>{formattedExpiresAt}</div>
        </FormField>
        <FormField title="tenants.license.installed_at_field">
          <div className={styles.value}>{dayjs(license.installedAt).format('MMM D, YYYY')}</div>
        </FormField>
        <FormField title="tenants.license.last_refreshed_at_field">
          <div className={styles.value}>{formattedLastRefreshedAt}</div>
        </FormField>
        <FormField title="tenants.license.grace_ends_at_field">
          <div className={styles.value}>{formattedGraceEndsAt}</div>
        </FormField>
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
