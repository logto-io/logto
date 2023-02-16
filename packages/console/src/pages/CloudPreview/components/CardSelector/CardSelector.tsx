import RadioGroup, { Radio } from '@/components/RadioGroup';

import type { Option } from './types';

type Props = {
  name: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  optionClassName?: string;
};

const CardSelector = ({ name, value, options, onChange, optionClassName }: Props) => (
  <RadioGroup type="compact" value={value} name={name} onChange={onChange}>
    {options.map(({ value: optionValue, title, icon }) => (
      <Radio
        key={optionValue}
        icon={icon}
        title={title}
        value={optionValue}
        className={optionClassName}
      />
    ))}
  </RadioGroup>
);

export default CardSelector;
