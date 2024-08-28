import { ServiceConnector } from '@logto/connector-kit';
import { emailRegEx, phoneInputRegEx } from '@logto/core-kit';
import { ConnectorType } from '@logto/schemas';
import { parsePhoneNumber } from '@logto/shared/universal';
import { conditional } from '@silverhand/essentials';
import { useEffect, useState } from 'react';
import { useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/ds-components/Button';
import FormField from '@/ds-components/FormField';
import TextInput from '@/ds-components/TextInput';
import { Tooltip } from '@/ds-components/Tip';
import useApi from '@/hooks/use-api';
import { onKeyDownHandler } from '@/utils/a11y';
import { trySubmitSafe } from '@/utils/form';

import * as styles from './index.module.scss';

type Props = {
  readonly connectorFactoryId: string;
  readonly connectorType: Exclude<ConnectorType, ConnectorType.Social>;
  readonly className?: string;
  readonly parse: () => unknown;
  readonly updateUsage?: () => void;
};

type FormData = {
  sendTo: string;
};

function ConnectorTester({
  connectorFactoryId,
  connectorType,
  className,
  parse,
  updateUsage,
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const {
    handleSubmit,
    register,
    formState: {
      errors: { sendTo: inputError },
      isSubmitting,
    },
  } = useForm<FormData>();
  const { trigger } = useFormContext();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const isSms = connectorType === ConnectorType.Sms;
  const isEmailServiceConnector = connectorFactoryId === ServiceConnector.Email;

  useEffect(() => {
    if (!showTooltip) {
      return;
    }

    const tooltipTimeout = setTimeout(() => {
      setShowTooltip(false);
    }, 2000);

    return () => {
      clearTimeout(tooltipTimeout);
    };
  }, [showTooltip]);

  const onSubmit = handleSubmit(
    trySubmitSafe(async (formData) => {
      const isConfigFormValid = await trigger(undefined, { shouldFocus: true });
      if (!isConfigFormValid) {
        return;
      }

      const { sendTo } = formData;

      const data = {
        config: parse(),
        ...(isSms ? { phone: parsePhoneNumber(sendTo) } : { email: sendTo }),
      };

      await api.post(`api/connectors/${connectorFactoryId}/test`, { json: data }).json();
      updateUsage?.();
      setShowTooltip(true);
    })
  );

  return (
    <div className={className}>
      <div className={styles.fields}>
        <FormField
          title={
            isSms ? 'connector_details.test_sms_sender' : 'connector_details.test_email_sender'
          }
          className={styles.textField}
        >
          <TextInput
            error={Boolean(inputError)}
            type={isSms ? 'tel' : 'email'}
            placeholder={
              isSms
                ? t('connector_details.test_sms_placeholder')
                : t('connector_details.test_email_placeholder')
            }
            onKeyDown={onKeyDownHandler({ Enter: onSubmit })}
            {...register('sendTo', {
              required: true,
              pattern: {
                value: isSms ? phoneInputRegEx : emailRegEx,
                message: t('connector_details.send_error_invalid_format'),
              },
            })}
          />
        </FormField>
        <Tooltip
          isKeepOpen
          isSuccessful
          anchorClassName={styles.send}
          content={conditional(showTooltip && t('connector_details.test_message_sent'))}
        >
          <Button
            isLoading={isSubmitting}
            title="connector_details.send"
            type="outline"
            onClick={onSubmit}
          />
        </Tooltip>
      </div>
      {!isEmailServiceConnector && (
        <div className={styles.description}>{t('connector_details.test_sender_description')}</div>
      )}
      <div className={styles.error}>{inputError?.message}</div>
    </div>
  );
}

export default ConnectorTester;
