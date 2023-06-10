import type { AdminConsoleKey } from '@logto/phrases';
import { TenantTag } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import RadioGroup, { Radio } from '@/components/RadioGroup';
import TextInput from '@/components/TextInput';

import { type TenantSettingsForm } from '../types.js';

import * as styles from './index.module.scss';

type Props = {
  currentTenantId: string;
};

const tagOptions: Array<{
  title: AdminConsoleKey;
  value: TenantTag;
}> = [
  {
    title: 'tenant_settings.profile.environment_tag_development',
    value: TenantTag.Development,
  },
  {
    title: 'tenant_settings.profile.environment_tag_staging',
    value: TenantTag.Staging,
  },
  {
    title: 'tenant_settings.profile.environment_tag_production',
    value: TenantTag.Production,
  },
];

function ProfileForm({ currentTenantId }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TenantSettingsForm>();

  return (
    <FormCard title="tenant_settings.profile.title">
      <FormField title="tenant_settings.profile.tenant_id">
        <CopyToClipboard value={currentTenantId} variant="border" className={styles.textField} />
      </FormField>
      <FormField isRequired title="tenant_settings.profile.tenant_name">
        <TextInput
          {...register('profile.name', { required: true })}
          error={Boolean(errors.profile?.name)}
        />
      </FormField>
      <FormField title="tenant_settings.profile.environment_tag">
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
          {t('tenant_settings.profile.environment_tag_description')}
        </div>
      </FormField>
    </FormCard>
  );
}

export default ProfileForm;
