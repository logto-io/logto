import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import KeyValueInputField from '@/ds-components/KeyValueInputField';
import { type WebhookDetailsFormType } from '@/pages/WebhookDetails/types';

const isValidHeaderKey = (key: string) => {
  return /^[\u0021-\u0039\u003B-\u007E]+$/.test(key);
};

const isValidHeaderValue = (value: string) => {
  return /^[\u0020-\u007E]*$/.test(value);
};

function CustomHeaderField() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    control,
    register,
    getValues,
    trigger,
    formState: {
      errors: { headers: headerErrors },
      submitCount,
    },
  } = useFormContext<WebhookDetailsFormType>();

  const { fields, remove, append } = useFieldArray({
    control,
    name: 'headers',
  });

  const validateKey = useCallback(
    (key: string, index: number) => {
      const headers = getValues('headers');
      if (!headers) {
        return true;
      }

      if (headers.filter(({ key: _key }) => _key.length > 0 && _key === key).length > 1) {
        return t('webhook_details.settings.key_duplicated_error');
      }

      const correspondValue = getValues(`headers.${index}.value`);
      if (correspondValue) {
        return Boolean(key) || t('webhook_details.settings.key_missing_error');
      }

      if (Boolean(key) && !isValidHeaderKey(key)) {
        return t('webhook_details.settings.invalid_key_error');
      }

      return true;
    },
    [getValues, t]
  );

  const validateValue = useCallback(
    (value: string, index: number) => {
      if (Boolean(value) && !isValidHeaderValue(value)) {
        return t('webhook_details.settings.invalid_value_error');
      }

      return getValues(`headers.${index}.key`)
        ? Boolean(value) || t('webhook_details.settings.value_missing_error')
        : true;
    },
    [getValues, t]
  );

  const revalidate = useCallback(() => {
    for (const [index] of fields.entries()) {
      void trigger(`headers.${index}.key`);
      if (submitCount > 0) {
        void trigger(`headers.${index}.value`);
      }
    }
  }, [fields, submitCount, trigger]);

  const getInputFieldProps = useMemo(
    () => ({
      key: (index: number) =>
        register(`headers.${index}.key`, {
          validate: (key) => validateKey(key, index),
          onChange: revalidate,
        }),
      value: (index: number) =>
        register(`headers.${index}.value`, {
          validate: (value) => validateValue(value, index),
          onChange: revalidate,
        }),
    }),
    [validateKey, register, revalidate, validateValue]
  );

  return (
    <FormField
      title="webhook_details.settings.custom_headers"
      tip={t('webhook_details.settings.custom_headers_tip')}
    >
      <KeyValueInputField
        fields={fields}
        // Force headerErrors to be an array, otherwise return undefined
        errors={headerErrors?.map?.((error) => error)}
        getInputFieldProps={getInputFieldProps}
        onAppend={append}
        onRemove={remove}
      />
    </FormField>
  );
}

export default CustomHeaderField;
