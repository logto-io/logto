import { urlRegEx } from '@logto/connector-kit';
import { conditional, conditionalString } from '@silverhand/essentials';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';

import FormCard from '@/components/FormCard';
import DynamicT from '@/ds-components/DynamicT';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import ImageUploaderField from '@/ds-components/Uploader/ImageUploaderField';
import useUserAssetsService from '@/hooks/use-user-assets-service';
import { type ConnectorFormType } from '@/types/connector';
import { uriValidator } from '@/utils/validator';

import * as styles from './index.module.scss';

type Props = {
  extraInfo?: Record<string, unknown>;
};

const extraInfoGuard = z.object({
  fromEmail: z.string(),
});

/**
 * Note:
 * This `EmailServiceConnectorForm` is hard-coded since the custom connector config form does not support i18n and we need i18n for our built-in connectors.
 *
 * TODO: @xiaoyijun @darcyYe remove this hard-coded form once the custom connector config form supports i18n.
 */
function EmailServiceConnectorForm({ extraInfo }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { isReady: isUserAssetsServiceReady } = useUserAssetsService();
  const parsedExtraInfo = extraInfoGuard.safeParse(extraInfo ?? {});

  const {
    control,
    register,
    formState: {
      errors: { formConfig: fromConfigErrors },
    },
  } = useFormContext<ConnectorFormType>();

  const validateInput = (value: string) => {
    const containUrl = urlRegEx.test(value);
    return containUrl ? t('connector_details.logto_email.urls_not_allowed') : true;
  };

  return (
    <FormCard
      title="connector_details.logto_email.email_template_title"
      description="connector_details.logto_email.template_description"
    >
      <FormField title="connector_details.logto_email.from_email_field">
        <TextInput
          readOnly
          value={conditionalString(parsedExtraInfo.success && parsedExtraInfo.data.fromEmail)}
        />
      </FormField>
      <FormField
        title="connector_details.logto_email.from_name_field"
        tip={<DynamicT forKey="connector_details.logto_email.from_name_tip" />}
      >
        <TextInput
          {...register('formConfig.fromName', {
            validate: (value) => validateInput(conditionalString(value)),
          })}
          error={fromConfigErrors?.fromName?.message}
          placeholder={t('connector_details.logto_email.from_name_placeholder')}
        />
      </FormField>
      <FormField
        title="connector_details.logto_email.company_address_field"
        tip={<DynamicT forKey="connector_details.logto_email.company_address_tip" />}
      >
        <TextInput
          {...register('formConfig.companyAddress', {
            validate: (value) => validateInput(conditionalString(value)),
          })}
          error={fromConfigErrors?.companyAddress?.message}
          placeholder={t('connector_details.logto_email.company_address_placeholder')}
        />
      </FormField>
      <FormField
        title="connector_details.logto_email.app_logo_field"
        tip={<DynamicT forKey="connector_details.logto_email.app_logo_tip" />}
        headlineClassName={conditional(isUserAssetsServiceReady && styles.imageFieldHeadline)}
      >
        {isUserAssetsServiceReady ? (
          <Controller
            name="formConfig.appLogo"
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <ImageUploaderField
                name={name}
                value={conditionalString(value)}
                onChange={onChange}
              />
            )}
          />
        ) : (
          <TextInput
            {...register('formConfig.appLogo', {
              validate: (value) =>
                !value || uriValidator(conditionalString(value)) || t('errors.invalid_uri_format'),
            })}
            error={fromConfigErrors?.appLogo?.message}
          />
        )}
      </FormField>
    </FormCard>
  );
}

export default EmailServiceConnectorForm;
