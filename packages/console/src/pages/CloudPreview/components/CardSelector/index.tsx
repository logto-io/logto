import type { AdminConsoleKey } from '@logto/phrases';
import type { ReactNode } from 'react';

import RadioGroup, { Radio } from '@/components/RadioGroup';

export type Option = {
  icon?: ReactNode;
  title: AdminConsoleKey;
  value: string;
};

type Props = {
  name: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

const CardSelector = ({ name, value, options, onChange }: Props) => (
  <RadioGroup type="compact" value={value} name={name} onChange={onChange}>
    {options.map(({ value: optionValue, title, icon }) => (
      <Radio key={optionValue} icon={icon} title={title} value={optionValue} />
    ))}
  </RadioGroup>
);

export default CardSelector;
