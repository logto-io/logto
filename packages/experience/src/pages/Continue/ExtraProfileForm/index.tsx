import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { condString } from '@silverhand/essentials';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import * as s from 'superstruct';

import Button from '@/components/Button';
import PrimitiveProfileInputField from '@/components/InputFields/PrimitiveProfileInputField';

import AddressSubForm from './AddressSubForm';
import FullnameSubForm from './FullnameSubForm';
import styles from './index.module.scss';
import useFieldLabel from './use-field-label';
import useValidateField from './use-validate-field';

type Props = {
  readonly customProfileFields: CustomProfileField[];
  readonly defaultValues?: Record<string, unknown>;
  readonly onSubmit: (values: Record<string, unknown>) => Promise<void>;
};

const ExtraProfileForm = ({ customProfileFields, defaultValues, onSubmit }: Props) => {
  const getFieldLabel = useFieldLabel();
  const validateField = useValidateField();
  const methods = useForm<Record<string, unknown>>({
    reValidateMode: 'onBlur',
    defaultValues,
  });

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const submit = handleSubmit(async (value) => {
    await onSubmit(value);
  });

  return (
    <FormProvider {...methods}>
      <form className={styles.form} onSubmit={submit}>
        {customProfileFields.map((field) => {
          if (field.type === CustomProfileFieldType.Fullname) {
            return <FullnameSubForm key={field.name} field={field} />;
          }
          const { name, type, label, description, required } = field;
          return (
            <Controller
              key={name}
              control={control}
              name={name}
              rules={{
                validate: (value) =>
                  validateField(value, { ...field, description: condString(description) }),
              }}
              render={({ field: { onBlur, onChange, value } }) => {
                if (type === CustomProfileFieldType.Address) {
                  return <AddressSubForm field={field} />;
                }

                s.assert(value, s.optional(s.string()));
                return (
                  <PrimitiveProfileInputField
                    {...field}
                    name={name}
                    label={label || getFieldLabel(name)}
                    description={condString(description)}
                    required={required}
                    value={value}
                    isDanger={!!errors[name]}
                    errorMessage={errors[name]?.message}
                    onChange={onChange}
                    onBlur={onBlur}
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
