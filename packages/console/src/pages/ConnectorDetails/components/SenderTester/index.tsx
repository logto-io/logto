import { ConnectorType } from '@logto/schemas';
import { phoneRegEx, emailRegEx } from '@logto/shared';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import Tooltip from '@/components/Tooltip';
import useApi from '@/hooks/use-api';

import * as styles from './index.module.scss';

type Props = {
  connectorId: string;
  connectorType: Exclude<ConnectorType, ConnectorType.Social>;
  config?: string;
  className?: string;
};

type FormData = {
  sendTo: string;
};

const SenderTester = ({ connectorId, connectorType, config, className }: Props) => {
  const buttonPosReference = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isSubmitting, seIsSubmitting] = useState(false);
  const {
    handleSubmit,
    register,
    formState: {
      errors: { sendTo: inputError },
    },
  } = useForm<FormData>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const api = useApi();
  const isSms = connectorType === ConnectorType.SMS;

  useEffect(() => {
    if (!showTooltip) {
      return;
    }

    const tooltipTimeout = setTimeout(() => {
      setShowTooltip(false);
      seIsSubmitting(false);
    }, 2000);

    return () => {
      clearTimeout(tooltipTimeout);
    };
  }, [showTooltip]);

  const onSubmit = handleSubmit(async (formData) => {
    const { sendTo } = formData;
    const configJson = config ? (JSON.parse(config) as JSON) : undefined;
    seIsSubmitting(true);

    const data = { config: configJson, ...(isSms ? { phone: sendTo } : { email: sendTo }) };

    try {
      await api
        .post(`/api/connectors/${connectorId}/test`, {
          json: data,
        })
        .json();
      setShowTooltip(true);
    } catch (error: unknown) {
      console.error(error);
      seIsSubmitting(false);
    }
  });

  return (
    <form className={className}>
      <div className={styles.fields}>
        <FormField
          isRequired
          title={
            isSms
              ? 'admin_console.connector_details.test_sms_sender'
              : 'admin_console.connector_details.test_email_sender'
          }
          className={styles.textField}
        >
          <TextInput
            hasError={Boolean(inputError?.message)}
            type={isSms ? 'tel' : 'email'}
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
            title="admin_console.connector_details.send"
            type="outline"
            onClick={onSubmit}
          />
        </div>
        {showTooltip && (
          <Tooltip
            isKeepOpen
            className={styles.successfulTooltip}
            anchorRef={buttonPosReference}
            content={t('connector_details.test_message_sent')}
          />
        )}
      </div>
      <div className={classNames(inputError?.message ? styles.error : styles.description)}>
        {inputError?.message ? inputError.message : t('connector_details.test_sender_description')}
      </div>
    </form>
  );
};

export default SenderTester;
