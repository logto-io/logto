import { CustomProfileFieldType, type FieldOption, Gender, type FieldPart } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import CheckboxField from '../CheckboxField';
import DateField from '../DateField';
import InputField from '../InputField';
import SelectField from '../SelectField';

type Props = Partial<Omit<FieldPart, 'enabled'>> & {
  readonly className?: string;
  readonly value?: string;
  readonly isDanger?: boolean;
  readonly errorMessage?: string;
  readonly onBlur?: () => void;
  readonly onChange: (value: string) => void;
};

const isGenderOptionKey = (key: string): key is Gender =>
  Object.values<string>(Gender).includes(key);

const PrimitiveProfileInputField = ({
  className,
  name,
  label,
  type,
  config,
  value,
  description,
  isDanger,
  errorMessage,
  required,
  onBlur,
  onChange,
}: Props) => {
  const { t } = useTranslation();
  const getDefaultOptions = (options?: FieldOption[]) =>
    options?.map(({ value, label }) => {
      if (!label && isGenderOptionKey(value)) {
        return { value, label: t(`profile.gender_options.${value}`) };
      }
      return { value, label: label ?? value };
    }) ?? [];

  const options = getDefaultOptions(config?.options);
  if (type === CustomProfileFieldType.Select) {
    return (
      <SelectField
        className={className}
        name={name}
        label={label}
        options={options}
        value={value}
        description={description}
        errorMessage={errorMessage}
        required={required}
        onBlur={onBlur}
        onChange={onChange}
      />
    );
  }
  if (type === CustomProfileFieldType.Checkbox) {
    return (
      <CheckboxField
        className={className}
        name={name}
        title={label}
        checked={value === 'true'}
        value={value}
        onChange={(checked) => {
          onChange(checked ? 'true' : 'false');
        }}
      />
    );
  }
  if (type === CustomProfileFieldType.Date) {
    return (
      <DateField
        className={className}
        name={name}
        label={label}
        dateFormat={config?.format}
        description={description}
        value={value}
        errorMessage={errorMessage}
        placeholder={config?.placeholder}
        required={required}
        onBlur={onBlur}
        onChange={onChange}
      />
    );
  }
  return (
    <InputField
      className={className}
      name={name}
      label={label}
      description={description}
      value={value ?? ''}
      isDanger={isDanger}
      errorMessage={errorMessage}
      placeholder={config?.placeholder}
      required={required}
      onChange={(event) => {
        onChange(event.currentTarget.value);
      }}
      onBlur={onBlur}
    />
  );
};

export default PrimitiveProfileInputField;
