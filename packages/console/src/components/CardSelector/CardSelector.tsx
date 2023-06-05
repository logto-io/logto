import RadioGroup, { Radio } from '@/components/RadioGroup';

import type { CardSelectorOption } from './types';

type Props = {
  name: string;
  value: string;
  options: CardSelectorOption[];
  onChange: (value: string) => void;
  optionClassName?: string;
};

function CardSelector({ name, value, options, onChange, optionClassName }: Props) {
  return (
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
}

export default CardSelector;
