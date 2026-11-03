import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormCard from '@/components/FormCard';
import KeyValueInputField from '@/ds-components/KeyValueInputField';

import {
  getStaticAttributeKeyError,
  getStaticAttributeValueError,
  type StaticAttributeFormRow,
} from './utils';

type FormWithStaticAttributes = {
  staticAttributes: StaticAttributeFormRow[];
};

function StaticAttributesField() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    control,
    register,
    getValues,
    trigger,
    formState: {
      errors: { staticAttributes: staticAttributeErrors },
      submitCount,
    },
  } = useFormContext<FormWithStaticAttributes>();

  const { fields, append, remove } = useFieldArray({ control, name: 'staticAttributes' });

  const validateKey = useCallback(
    (index: number) => {
      const error = getStaticAttributeKeyError(getValues('staticAttributes'), index);
      return error ? t(`webhook_details.settings.${error}`) : true;
    },
    [getValues, t]
  );

  const validateValue = useCallback(
    (index: number) => {
      const error = getStaticAttributeValueError(getValues('staticAttributes'), index);
      return error ? t(`webhook_details.settings.${error}`) : true;
    },
    [getValues, t]
  );

  const revalidate = useCallback(() => {
    for (const [index] of fields.entries()) {
      void trigger(`staticAttributes.${index}.key`);
      if (submitCount > 0) {
        void trigger(`staticAttributes.${index}.value`);
      }
    }
  }, [fields, submitCount, trigger]);

  const getInputFieldProps = useMemo(
    () => ({
      key: (index: number) =>
        register(`staticAttributes.${index}.key`, {
          validate: () => validateKey(index),
          onChange: revalidate,
        }),
      value: (index: number) =>
        register(`staticAttributes.${index}.value`, {
          validate: () => validateValue(index),
          onChange: revalidate,
        }),
    }),
    [register, revalidate, validateKey, validateValue]
  );

  return (
    <FormCard
      title="application_details.saml_app_attribute_mapping.static_attributes_title"
      description="application_details.saml_app_attribute_mapping.static_attributes_description"
    >
      <KeyValueInputField
        fields={fields}
        // Force the errors to be an array, otherwise return undefined
        errors={staticAttributeErrors?.map?.((error) => error)}
        getInputFieldProps={getInputFieldProps}
        onAppend={append}
        onRemove={remove}
      />
    </FormCard>
  );
}

export default StaticAttributesField;
