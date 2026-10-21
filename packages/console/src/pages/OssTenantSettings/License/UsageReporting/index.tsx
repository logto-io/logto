import { type AdminConsoleKey } from '@logto/phrases';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import DynamicT from '@/ds-components/DynamicT';
import Tag from '@/ds-components/Tag';

import styles from './index.module.scss';

type Props = {
  /** Whether the license refresh sends the usage of this deployment to Logto. */
  readonly isEnabled: boolean;
};

/** The fields a license refresh sends, as documented in the self-hosted terms. */
const reportedFields: readonly AdminConsoleKey[] = Object.freeze([
  'tenants.license.usage_reporting_field_license',
  'tenants.license.usage_reporting_field_version',
  'tenants.license.usage_reporting_field_usage',
  'tenants.license.usage_reporting_field_no_pii',
]);

/**
 * The read-only usage reporting state of this deployment. Reporting is turned off with an
 * environment variable on every Core instance, so Console has no control for it; this explains
 * the state and lists exactly what a refresh sends.
 */
function UsageReporting({ isEnabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="tenants.license.usage_reporting_title"
      description="tenants.license.usage_reporting_description"
    >
      <div className={styles.status}>
        <Tag type="state" status={isEnabled ? 'success' : 'alert'}>
          {t(
            isEnabled
              ? 'tenants.license.usage_reporting_enabled'
              : 'tenants.license.usage_reporting_disabled'
          )}
        </Tag>
        <div className={styles.description}>
          {t(
            isEnabled
              ? 'tenants.license.usage_reporting_enabled_description'
              : 'tenants.license.usage_reporting_disabled_description'
          )}
        </div>
      </div>
      <div className={styles.fieldsTitle}>{t('tenants.license.usage_reporting_fields_title')}</div>
      <ul className={styles.fields}>
        {reportedFields.map((key) => (
          <li key={key}>
            <DynamicT forKey={key} />
          </li>
        ))}
      </ul>
    </FormCard>
  );
}

export default UsageReporting;
