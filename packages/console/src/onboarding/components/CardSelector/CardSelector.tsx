import RadioGroup, { Radio } from '@/ds-components/RadioGroup';

import type { CardSelectorOption } from './types';

type Props = {
  readonly name: string;
  readonly value: string;
  readonly options: CardSelectorOption[];
  readonly onChange: (value: string) => void;
  readonly optionClassName?: string;
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
