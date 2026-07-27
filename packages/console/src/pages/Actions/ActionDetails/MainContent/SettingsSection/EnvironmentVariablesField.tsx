import { useCallback, useMemo } from 'react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import FormField from '@/ds-components/FormField';
import KeyValueInputField from '@/ds-components/KeyValueInputField';
import { isValidEnvironmentVariableKey } from '@/utils/validator';

import { type ActionForm } from '../../type';

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
  } = useFormContext<ActionForm>();

  const { fields, remove, append } = useFieldArray<ActionForm>({
    name: 'environmentVariables',
  });

  const keyValidator = useCallback(
    (key: string, index: number) => {
      const envVariables = getValues('environmentVariables');

      if (!envVariables) {
        return true;
      }

      // Match request formatting / Monaco typing, which trim keys before use.
      const trimmedKey = key.trim();

      if (
        envVariables.filter(({ key: _key }) => {
          const trimmed = _key.trim();
          return trimmed.length > 0 && trimmed === trimmedKey;
        }).length > 1
      ) {
        return t('webhook_details.settings.key_duplicated_error');
      }

      const correspondValue = getValues(`environmentVariables.${index}.value`);
      if (correspondValue && !trimmedKey) {
        return t('webhook_details.settings.key_missing_error');
      }

      if (Boolean(trimmedKey) && !isValidEnvironmentVariableKey(trimmedKey)) {
        return t('webhook_details.settings.invalid_key_error');
      }

      return true;
    },
    [getValues, t]
  );

  const valueValidator = useCallback(
    (value: string, index: number) => {
      return getValues(`environmentVariables.${index}.key`).trim()
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
    <FormField title="actions.environment_variables.input_field_title" className={className}>
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
