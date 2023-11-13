import type { AdminConsoleKey } from '@logto/phrases';
import { TenantTag } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import { isDevFeaturesEnabled } from '@/consts/env';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';

import { type TenantSettingsForm } from '../types.js';

import TenantEnvironment from './TenantEnvironment/index.js';
import TenantRegion from './TenantRegion/index.js';
import * as styles from './index.module.scss';

type Props = {
  currentTenantId: string;
};

const tagOptions: Array<{
  title: AdminConsoleKey;
  value: TenantTag;
}> = [
  {
    title: 'tenants.settings.environment_tag_development',
    value: TenantTag.Development,
  },
  {
    title: 'tenants.settings.environment_tag_staging',
    value: TenantTag.Staging,
  },
  {
    title: 'tenants.settings.environment_tag_production',
    value: TenantTag.Production,
  },
];

function ProfileForm({ currentTenantId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    formState: { errors },
    getValues,
  } = useFormContext<TenantSettingsForm>();

  return (
    <FormCard title="tenants.settings.title">
      <FormField title="tenants.settings.tenant_id">
        <CopyToClipboard value={currentTenantId} variant="border" className={styles.textField} />
      </FormField>
      <FormField isRequired title="tenants.settings.tenant_name">
        <TextInput
          {...register('profile.name', { required: true })}
          error={Boolean(errors.profile?.name)}
        />
      </FormField>
      {isDevFeaturesEnabled && (
        <FormField title="tenants.settings.tenant_region">
          <TenantRegion />
        </FormField>
      )}
      {!isDevFeaturesEnabled && (
        <FormField title="tenants.settings.environment_tag">
          <Controller
            control={control}
            name="profile.tag"
            render={({ field: { onChange, value, name } }) => (
              <RadioGroup type="small" value={value} name={name} onChange={onChange}>
                {tagOptions.map(({ value: optionValue, title }) => (
                  <Radio key={optionValue} title={title} value={optionValue} />
                ))}
              </RadioGroup>
            )}
          />
          <div className={styles.description}>
            {t('tenants.settings.environment_tag_description')}
          </div>
        </FormField>
      )}
      {isDevFeaturesEnabled && (
        <FormField title="tenants.settings.environment_tag">
          <TenantEnvironment tag={getValues('profile.tag')} />
        </FormField>
      )}
    </FormCard>
  );
}

export default ProfileForm;
