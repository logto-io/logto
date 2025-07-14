import { CustomProfileFieldType, type CustomProfileField } from '@logto/schemas';
import { Controller, useForm } from 'react-hook-form';
import * as s from 'superstruct';

import Button from '@/components/Button';
import { InputField } from '@/components/InputFields';
import AddressField from '@/components/InputFields/AddressField';
import FullnameField from '@/components/InputFields/FullnameField';
import SelectField from '@/components/InputFields/SelectField';
import {
  addressFieldConfigGuard,
  addressFieldValueGuard,
  fullnameFieldConfigGuard,
  fullnameFieldValueGuard,
} from '@/types/guard';

import styles from './index.module.scss';
import { useFieldLabel } from './use-field-label';

type Props = {
  readonly customProfileFields: CustomProfileField[];
  readonly defaultValues?: Record<string, unknown>;
  readonly onSubmit: (values: Record<string, unknown>) => void;
};

const ExtraProfileForm = ({ customProfileFields, defaultValues, onSubmit }: Props) => {
  const getFieldLabel = useFieldLabel();
  const {
    handleSubmit,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<Record<string, unknown>>({
    reValidateMode: 'onBlur',
    defaultValues,
  });

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      {customProfileFields.map(({ name, type, required, label, description, config }) => (
        <Controller
          key={name}
          control={control}
          name={name}
          rules={{ required }}
          render={({ field: { onChange, value } }) => {
            if (type === CustomProfileFieldType.Fullname) {
              s.assert(value, fullnameFieldValueGuard);
              s.assert(config, fullnameFieldConfigGuard);
              return <FullnameField parts={config.parts} value={value} onChange={onChange} />;
            }
            if (type === CustomProfileFieldType.Address) {
              s.assert(value, addressFieldValueGuard);
              s.assert(config, addressFieldConfigGuard);
              return <AddressField parts={config.parts} value={value} onChange={onChange} />;
            }

            s.assert(value, s.optional(s.string()));

            if (type === CustomProfileFieldType.Select) {
              s.assert(config.options, s.array(s.object({ value: s.string(), label: s.string() })));
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
      ))}
      <Button title="action.continue" htmlType="submit" isLoading={isSubmitting} />

      <input hidden type="submit" />
    </form>
  );
};

export default ExtraProfileForm;
