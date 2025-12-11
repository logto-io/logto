import { RecaptchaEnterpriseMode } from '@logto/schemas';
import { type UseFormRegister, type FieldErrors, Controller, type Control } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import InlineNotification from '@/ds-components/InlineNotification';
import RadioGroup, { Radio } from '@/ds-components/RadioGroup';
import TextInput from '@/ds-components/TextInput';

import { type CaptchaProviderMetadata } from '../CreateCaptchaForm/types';
import { type CaptchaFormType } from '../types';

import styles from './index.module.scss';

type Props = {
  readonly metadata: CaptchaProviderMetadata;
  readonly errors: FieldErrors;
  readonly register: UseFormRegister<CaptchaFormType>;
  readonly control: Control<CaptchaFormType>;
};

function CaptchaFormFields({ metadata, errors, register, control }: Props) {
  const siteKeyField = metadata.requiredFields.find((field) => field.field === 'siteKey');
  const secretKeyField = metadata.requiredFields.find((field) => field.field === 'secretKey');
  const projectIdField = metadata.requiredFields.find((field) => field.field === 'projectId');
  const domainField = metadata.requiredFields.find((field) => field.field === 'domain');
  const modeField = metadata.requiredFields.find((field) => field.field === 'mode');
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <>
      {siteKeyField && (
        <FormField isRequired title={siteKeyField.label}>
          <TextInput
            error={Boolean(errors.siteKey)}
            placeholder={String(t(siteKeyField.placeholder))}
            {...register('siteKey', { required: true })}
          />
        </FormField>
      )}
      {secretKeyField && (
        <FormField isRequired title={secretKeyField.label}>
          <TextInput
            error={Boolean(errors.secretKey)}
            placeholder={String(t(secretKeyField.placeholder))}
            {...register('secretKey', { required: true })}
          />
        </FormField>
      )}
      {projectIdField && (
        <FormField isRequired title={projectIdField.label}>
          <TextInput
            error={Boolean(errors.projectId)}
            placeholder={String(t(projectIdField.placeholder))}
            {...register('projectId', { required: true })}
          />
        </FormField>
      )}
      {domainField && (
        <FormField isRequired={!domainField.isOptional} title={domainField.label}>
          <TextInput
            error={Boolean(errors.domain)}
            placeholder={String(t(domainField.placeholder))}
            {...register('domain', { required: !domainField.isOptional })}
          />
        </FormField>
      )}
      {modeField && (
        <>
          <FormField title={modeField.label}>
            <Controller
              name="mode"
              control={control}
              defaultValue={RecaptchaEnterpriseMode.Invisible}
              render={({ field: { onChange, value } }) => (
                <RadioGroup name="mode" value={value} onChange={onChange}>
                  <Radio
                    title="security.captcha_details.mode_invisible"
                    value={RecaptchaEnterpriseMode.Invisible}
                  />
                  <Radio
                    title="security.captcha_details.mode_checkbox"
                    value={RecaptchaEnterpriseMode.Checkbox}
                  />
                </RadioGroup>
              )}
            />
          </FormField>
          <InlineNotification className={styles.modeNotice} severity="alert">
            {t('security.captcha_details.mode_notice')}
          </InlineNotification>
        </>
      )}
    </>
  );
}

export default CaptchaFormFields;
