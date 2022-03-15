import { ConnectorType } from '@logto/schemas';
import classNames from 'classnames';
import ky from 'ky';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import FormField from '@/components/FormField';
import TextInput from '@/components/TextInput';
import Tooltip from '@/components/Tooltip';
import { phoneRegEx, emailRegEx } from '@/utilities/regex';

import * as styles from './index.module.scss';

type Props = {
  connectorType: Exclude<ConnectorType, ConnectorType.Social>;
};

type FormData = {
  sendTo: string;
};

const SenderTester = ({ connectorType }: Props) => {
  const buttonPosReference = useRef(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const {
    handleSubmit,
    register,
    formState: {
      errors: { sendTo: inputError },
    },
  } = useForm<FormData>();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isSms = connectorType === ConnectorType.SMS;

  useEffect(() => {
    if (!showTooltip) {
      return;
    }

    const tooltipTimeout = setTimeout(() => {
      setShowTooltip(false);
      setSubmitting(false);
    }, 2000);

    return () => {
      clearTimeout(tooltipTimeout);
    };
  }, [showTooltip]);

  const onSubmit = handleSubmit(async (formData) => {
    const { sendTo } = formData;
    setSubmitting(true);

    const data = isSms ? { phone: sendTo } : { email: sendTo };

    try {
      await ky
        .post(`/api/connectors/test/${connectorType.toLowerCase()}`, {
          json: data,
        })
        .json();
      setShowTooltip(true);
    } catch (error: unknown) {
      console.error(error);
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit}>
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
            htmlType="submit"
            disabled={submitting}
            title="admin_console.connector_details.send"
            type="primary"
          />
        </div>
        {showTooltip && (
          <Tooltip
            behavior="visibleByDefault"
            domRef={buttonPosReference}
            className={styles.successTooltip}
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
