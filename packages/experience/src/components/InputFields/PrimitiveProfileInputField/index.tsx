import { CustomProfileFieldType, type FieldPart } from '@logto/schemas';

import CheckboxGroup from '@/components/CheckboxGroup';

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

const PrimitiveProfileInputField = ({
  className,
  label,
  type,
  config,
  value,
  description,
  isDanger,
  errorMessage,
  onBlur,
  onChange,
}: Props) => {
  if (type === CustomProfileFieldType.Select) {
    return (
      <SelectField
        className={className}
        label={label}
        options={config?.options ?? []}
        value={value}
        description={description}
        onBlur={onBlur}
        onChange={onChange}
      />
    );
  }
  if (type === CustomProfileFieldType.Checkbox) {
    return (
      <CheckboxGroup
        className={className}
        options={config?.options ?? []}
        value={value?.split(',') ?? []}
        description={description}
        onChange={(value) => {
          onChange(value.join(','));
        }}
      />
    );
  }
  return (
    <InputField
      className={className}
      label={label}
      description={description}
      value={value ?? ''}
      isDanger={isDanger}
      errorMessage={errorMessage}
      placeholder={config?.placeholder}
      onChange={(event) => {
        onChange(event.currentTarget.value);
      }}
      onBlur={onBlur}
    />
  );
};

export default PrimitiveProfileInputField;
