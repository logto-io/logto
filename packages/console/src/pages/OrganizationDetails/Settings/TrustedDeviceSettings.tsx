import { type UseFormRegister } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Switch from '@/ds-components/Switch';

import { type FormData } from '../utils';

import styles from './index.module.scss';

type Props = {
  readonly isGlobalPolicyEnabled: boolean;
  readonly isGlobalPolicyLoaded: boolean;
  readonly register: UseFormRegister<FormData>;
};

function TrustedDeviceSettings({ isGlobalPolicyEnabled, isGlobalPolicyLoaded, register }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <FormField
      title="mfa.trusted_device.organization_allow_title"
      tip={t('mfa.trusted_device.organization_allow_tip')}
    >
      <Switch
        disabled={!isGlobalPolicyEnabled}
        description="mfa.trusted_device.organization_allow_description"
        {...register('isTrustedDeviceAllowed')}
      />
      {isGlobalPolicyLoaded && !isGlobalPolicyEnabled && (
        <InlineNotification className={styles.trustedDeviceNotice}>
          {t('mfa.trusted_device.organization_global_disabled')}
        </InlineNotification>
      )}
    </FormField>
  );
}

export default TrustedDeviceSettings;
