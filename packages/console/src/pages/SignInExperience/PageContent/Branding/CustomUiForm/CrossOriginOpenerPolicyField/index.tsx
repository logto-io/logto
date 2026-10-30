import { CrossOriginOpenerPolicy } from '@logto/schemas';
import { useController, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import DangerousRaw from '@/ds-components/DangerousRaw';
import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import Select from '@/ds-components/Select';

import type { SignInExperienceForm } from '../../../../types';
import styles from '../index.module.scss';

type Props = {
  readonly isDisabled: boolean;
};

function CrossOriginOpenerPolicyField({ isDisabled }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { control } = useFormContext<SignInExperienceForm>();
  const {
    field: { onChange, value },
  } = useController({ name: 'crossOriginOpenerPolicy', control });

  return (
    <FormField
      title={<DangerousRaw>Cross-Origin-Opener-Policy</DangerousRaw>}
      tip={t('sign_in_exp.custom_ui.coop_tip')}
    >
      <Select
        isReadOnly={isDisabled}
        value={value}
        options={[
          {
            value: CrossOriginOpenerPolicy.UnsafeNone,
            title: t('sign_in_exp.custom_ui.coop_unsafe_none'),
          },
          {
            value: CrossOriginOpenerPolicy.SameOriginAllowPopups,
            title: t('sign_in_exp.custom_ui.coop_same_origin_allow_popups'),
          },
          {
            value: CrossOriginOpenerPolicy.SameOrigin,
            title: CrossOriginOpenerPolicy.SameOrigin,
          },
        ]}
        onChange={onChange}
      />
      {value !== CrossOriginOpenerPolicy.UnsafeNone && (
        <InlineNotification severity="alert" className={styles.coopWarning}>
          {t('sign_in_exp.custom_ui.coop_warning')}
        </InlineNotification>
      )}
    </FormField>
  );
}

export default CrossOriginOpenerPolicyField;
