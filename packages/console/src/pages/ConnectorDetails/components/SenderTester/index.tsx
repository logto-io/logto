import { phoneRegEx, emailRegEx } from '@logto/core-kit';
import { ConnectorType } from '@logto/schemas';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import Tooltip from '@/components/Tooltip';
import useApi from '@/hooks/use-api';
import { safeParseJson } from '@/utilities/json';

import * as styles from './index.module.scss';

type Props = {
  connectorId: string;
  connectorType: Exclude<ConnectorType, ConnectorType.Social>;
  config: string;
  className?: string;
};

type FormData = {
  sendTo: string;
};

const SenderTester = ({ connectorId, connectorType, config, className }: Props) => {
  const buttonPosReference = useRef(null);
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

  const onSubmit = handleSubmit(async (formData) => {
    const { sendTo } = formData;

    const result = safeParseJson(config);

    if (!result.success) {
      toast.error(result.error);

      return;
    }

    const data = { config: result.data, ...(isSms ? { phone: sendTo } : { email: sendTo }) };

    await api.post(`/api/connectors/${connectorId}/test`, { json: data }).json();

    setShowTooltip(true);
  });

  return (
    <div className={className}>
      <div className={styles.fields}>
        <FormField
          isRequired
          title={
            isSms ? 'connector_details.test_sms_sender' : 'connector_details.test_email_sender'
          }
          className={styles.textField}
        >
          <TextInput
            hasError={Boolean(inputError?.message)}
            type={isSms ? 'tel' : 'email'}
            placeholder={
              isSms
                ? t('connector_details.test_sms_placeholder')
                : t('connector_details.test_email_placeholder')
            }
            {...register('sendTo', {
              required: true,
              pattern: {
                value: isSms ? phoneRegEx : emailRegEx,
                message: t('connector_details.send_error_invalid_format'),
              },
            })}
          />
        </FormField>
        <div ref={buttonPosReference} className={styles.send}>
          <Button
            isLoading={isSubmitting}
            title="connector_details.send"
            type="outline"
            onClick={onSubmit}
          />
        </div>
        {showTooltip && (
          <Tooltip
            isKeepOpen
            horizontalAlign="center"
            className={styles.successfulTooltip}
            anchorRef={buttonPosReference}
            content={t('connector_details.test_message_sent')}
          />
        )}
      </div>
      <div className={classNames(inputError?.message ? styles.error : styles.description)}>
        {inputError?.message ?? t('connector_details.test_sender_description')}
      </div>
    </div>
  );
};

export default SenderTester;
