import type { Application, SnakeCaseOidcConfig } from '@logto/schemas';
import { ApplicationType, UserRole } from '@logto/schemas';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import CopyToClipboard from '@/components/CopyToClipboard';
import FormCard from '@/components/FormCard';
import FormField from '@/components/FormField';
import Switch from '@/components/Switch';

import * as styles from '../index.module.scss';

type Props = {
  applicationType: ApplicationType;
  oidcConfig: SnakeCaseOidcConfig;
};

const AdvancedSettings = ({ applicationType, oidcConfig }: Props) => {
  const { control } = useFormContext<Application>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormCard
      title="application_details.advanced_settings"
      description="application_details.advanced_settings_description"
    >
      <FormField
        title="application_details.authorization_endpoint"
        tooltip="application_details.authorization_endpoint_tip"
      >
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.authorization_endpoint}
          variant="border"
        />
      </FormField>
      <FormField title="application_details.token_endpoint">
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.token_endpoint}
          variant="border"
        />
      </FormField>
      <FormField title="application_details.user_info_endpoint">
        <CopyToClipboard
          className={styles.textField}
          value={oidcConfig.userinfo_endpoint}
          variant="border"
        />
      </FormField>
      {applicationType === ApplicationType.MachineToMachine && (
        <FormField title="application_details.enable_admin_access">
          <Controller
            name="roleNames"
            control={control}
            defaultValue={[]}
            render={({ field: { onChange, value } }) => (
              <Switch
                label={t('application_details.enable_admin_access_label')}
                checked={value.includes(UserRole.Admin)}
                onChange={({ currentTarget: { checked } }) => {
                  if (checked) {
                    onChange([...new Set(value.concat(UserRole.Admin))]);
                  } else {
                    onChange(value.filter((value) => value !== UserRole.Admin));
                  }
                }}
              />
            )}
          />
        </FormField>
      )}
    </FormCard>
  );
};

export default AdvancedSettings;
