import { emailRegEx, phoneInputRegEx } from '@logto/core-kit';
import { ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import { Tooltip } from '@/components/Tip';
import useApi from '@/hooks/use-api';
import { onKeyDownHandler } from '@/utils/a11y';
import { safeParseJson } from '@/utils/json';

import * as styles from './index.module.scss';

type Props = {
  connectorFactoryId: string;
  connectorType: Exclude<ConnectorType, ConnectorType.Social>;
  className?: string;
  formConfig?: Record<string, unknown>;
  stringConfig?: string;
};

type FormData = {
  sendTo: string;
};

const SenderTester = ({
  connectorFactoryId,
  connectorType,
  className,
  formConfig,
  stringConfig,
}: Props) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const {
    handleSubmit,
    register,
    formState: {
      errors: { sendTo: inputError },
      isSubmitting,
    },
  } = useForm<FormData>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const isSms = connectorType === ConnectorType.Sms;

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

  const stringConfigParser = useCallback(
    (config?: string) => {
      if (!config) {
        toast.error(t('connector_details.save_error_empty_config'));

        return;
      }

      const result = safeParseJson(config);

      if (!result.success) {
        toast.error(result.error);

        return;
      }

      return result.data;
    },
    [t]
  );

  const onSubmit = handleSubmit(async (formData) => {
    const { sendTo } = formData;

    const data = {
      config: formConfig ?? stringConfigParser(stringConfig),
      ...(isSms
        ? { phone: sendTo.replace(/[ ()-]/g, '').replace(/\+/g, '00') }
        : { email: sendTo }),
    };

    try {
      await api.post(`api/connectors/${connectorFactoryId}/test`, { json: data }).json();
      setShowTooltip(true);
    } catch (error: unknown) {
      console.error(error);
    }
  });

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
            hasError={Boolean(inputError)}
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
      <div className={styles.description}>{t('connector_details.test_sender_description')}</div>
      <div className={styles.error}>{inputError?.message}</div>
    </div>
  );
};

export default SenderTester;
