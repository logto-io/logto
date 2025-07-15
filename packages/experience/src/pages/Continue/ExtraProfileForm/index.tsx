import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import * as s from 'superstruct';

import Button from '@/components/Button';
import { InputField } from '@/components/InputFields';
import AddressField from '@/components/InputFields/AddressField';
import SelectField from '@/components/InputFields/SelectField';
import { addressFieldConfigGuard, addressFieldValueGuard } from '@/types/guard';

import FullnameSubForm from './FullnameSubForm';
import styles from './index.module.scss';
import { useFieldLabel } from './use-field-label';

type Props = {
  readonly customProfileFields: CustomProfileField[];
  readonly defaultValues?: Record<string, unknown>;
  readonly onSubmit: (values: Record<string, unknown>) => void;
};

const ExtraProfileForm = ({ customProfileFields, defaultValues, onSubmit }: Props) => {
  const getFieldLabel = useFieldLabel();
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
              rules={{ required }}
              render={({ field: { onChange, value } }) => {
                if (type === CustomProfileFieldType.Address) {
                  s.assert(value, addressFieldValueGuard);
                  s.assert(config, addressFieldConfigGuard);
                  return <AddressField parts={config.parts} value={value} onChange={onChange} />;
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
                      onChange={onChange}
                    />
                  );
                }
                return (
                  <InputField
                    label={getFieldLabel(name, label)}
                    description={description}
                    value={value}
                    errorMessage={errors[name]?.message}
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
