import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import KeyValueInputField from '@/ds-components/KeyValueInputField';

import { type InlineHookForm } from '../../type';

const isValidKey = (key: string) => {
  return /^\w+$/.test(key);
};

type Props = {
  readonly className?: string;
};

function EnvironmentVariablesField({ className }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    register,
    getValues,
    trigger,
    formState: {
      errors: { environmentVariables: envVariableErrors },
      submitCount,
    },
  } = useFormContext<InlineHookForm>();

  const { fields, remove, append } = useFieldArray<InlineHookForm>({
    name: 'environmentVariables',
  });

  const keyValidator = useCallback(
    (key: string, index: number) => {
      const envVariables = getValues('environmentVariables');

      if (!envVariables) {
        return true;
      }

      if (envVariables.filter(({ key: _key }) => _key.length > 0 && _key === key).length > 1) {
        return t('webhook_details.settings.key_duplicated_error');
      }

      const correspondValue = getValues(`environmentVariables.${index}.value`);
      if (correspondValue) {
        return Boolean(key) || t('webhook_details.settings.key_missing_error');
      }

      if (Boolean(key) && !isValidKey(key)) {
        return t('webhook_details.settings.invalid_key_error');
      }

      return true;
    },
    [getValues, t]
  );

  const valueValidator = useCallback(
    (value: string, index: number) => {
      return getValues(`environmentVariables.${index}.key`)
        ? Boolean(value) || t('webhook_details.settings.value_missing_error')
        : true;
    },
    [getValues, t]
  );

  const revalidate = useCallback(() => {
    for (const [index] of fields.entries()) {
      void trigger(`environmentVariables.${index}.key`);

      if (submitCount > 0) {
        void trigger(`environmentVariables.${index}.value`);
      }
    }
  }, [fields, submitCount, trigger]);

  const getInputFieldProps = useMemo(
    () => ({
      key: (index: number) =>
        register(`environmentVariables.${index}.key`, {
          validate: (key) => keyValidator(key, index),
          onChange: revalidate,
        }),
      value: (index: number) =>
        register(`environmentVariables.${index}.value`, {
          validate: (value) => valueValidator(value, index),
          onChange: revalidate,
        }),
    }),
    [register, revalidate, keyValidator, valueValidator]
  );

  return (
    <FormField title="inline_hooks.environment_variables.input_field_title" className={className}>
      <KeyValueInputField
        fields={fields}
        errors={envVariableErrors?.map?.((error) => error)}
        getInputFieldProps={getInputFieldProps}
        onAppend={append}
        onRemove={remove}
      />
    </FormField>
  );
}

export default EnvironmentVariablesField;
