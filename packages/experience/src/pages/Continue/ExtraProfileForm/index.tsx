import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import * as s from 'superstruct';

import Button from '@/components/Button';
import { InputField } from '@/components/InputFields';
import AddressField from '@/components/InputFields/AddressField';
import SelectField from '@/components/InputFields/SelectField';
import { addressFieldConfigGuard, addressFieldValueGuard } from '@/types/guard';

import FullnameSubForm from './FullnameSubForm';
import styles from './index.module.scss';
import useFieldLabel from './use-field-label';
import useValidateField from './use-validate-field';

type Props = {
  readonly customProfileFields: CustomProfileField[];
  readonly defaultValues?: Record<string, unknown>;
  readonly onSubmit: (values: Record<string, unknown>) => void;
};

const ExtraProfileForm = ({ customProfileFields, defaultValues, onSubmit }: Props) => {
  const { t } = useTranslation();
  const getFieldLabel = useFieldLabel();
  const validateField = useValidateField();
  const methods = useForm<Record<string, unknown>>({
    reValidateMode: 'onBlur',
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = methods;

  const submit = handleSubmit((value) => {
    if (!isValid) {
      return;
    }
    onSubmit(value);
  });

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={submit}>
        {customProfileFields.map((field) => {
          if (field.type === CustomProfileFieldType.Fullname) {
            return <FullnameSubForm key={field.name} field={field} />;
          }
          const { name, type, required, label, description, config } = field;
          return (
            <Controller
              key={name}
              control={control}
              name={name}
              rules={{
                required: cond(
                  required && t('error.general_required', { types: [getFieldLabel(name, label)] })
                ),
                validate: (value) => validateField(value, field),
              }}
              render={({ field: { onChange, value } }) => {
                if (type === CustomProfileFieldType.Address) {
                  s.assert(value, addressFieldValueGuard);
                  s.assert(config, addressFieldConfigGuard);
                  return (
                    <AddressField
                      parts={config.parts}
                      value={value}
                      description={description}
                      errorMessage={errors[name]?.message}
                      onChange={onChange}
                    />
                  );
                }

                s.assert(value, s.optional(s.string()));

                if (type === CustomProfileFieldType.Select) {
                  s.assert(
                    config.options,
                    s.array(s.object({ value: s.string(), label: s.string() }))
                  );
                  return (
                    <SelectField
                      label={getFieldLabel(name, label)}
                      options={config.options}
                      value={value}
                      description={description}
                      errorMessage={errors[name]?.message}
                      onChange={onChange}
                    />
                  );
                }
                return (
                  <InputField
                    label={getFieldLabel(name, label)}
                    description={description}
                    value={value ?? ''}
                    isDanger={!!errors[name]?.message}
                    errorMessage={errors[name]?.message}
                    placeholder={config.placeholder ?? config.format}
                    onChange={onChange}
                  />
                );
              }}
            />
          );
        })}
        <Button title="action.continue" htmlType="submit" isLoading={isSubmitting} />

        <input hidden type="submit" />
      </form>
    </FormProvider>
  );
};

export default ExtraProfileForm;
