import { LicenseEnv } from '@logto/schemas';
import dayjs from 'dayjs';
import { useState } from 'react';

import FormCard from '@/components/FormCard';
import SkuName from '@/components/SkuName';
import Button from '@/ds-components/Button';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import Tag from '@/ds-components/Tag';
import { type License } from '@/types/license';

import InstallForm from '../InstallForm';
import { licenseEnvPhraseKeys } from '../utils';

import styles from './index.module.scss';

type Props = {
  readonly license: License;
};

function LicenseDetails({ license }: Props) {
  const [isReplacing, setIsReplacing] = useState(false);

  return (
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
        <div className={styles.value}>{dayjs(license.expiresAt).format('MMM D, YYYY')}</div>
      </FormField>
      <FormField title="tenants.license.installed_at_field">
        <div className={styles.value}>{dayjs(license.installedAt).format('MMM D, YYYY')}</div>
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
  );
}

export default LicenseDetails;
