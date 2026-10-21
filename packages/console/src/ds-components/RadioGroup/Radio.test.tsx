import { fireEvent, render, screen } from '@testing-library/react';

import RadioGroup, { Radio } from '.';

describe('<RadioGroup />', () => {
  it('exposes disabled choices and keeps them out of the tab sequence', () => {
    const onChange = jest.fn();

    render(
      <RadioGroup name="provider" value="enabled" onChange={onChange}>
        <Radio value="enabled">Enabled</Radio>
        <Radio isDisabled value="disabled">
          Disabled
        </Radio>
      </RadioGroup>
    );

    const enabled = screen.getByRole('radio', { name: 'Enabled' });
    const disabled = screen.getByRole('radio', { name: 'Disabled' });

    expect(enabled.getAttribute('aria-checked')).toBe('true');
    expect(enabled.getAttribute('tabindex')).toBe('0');
    expect(disabled.getAttribute('aria-checked')).toBe('false');
    expect(disabled.getAttribute('aria-disabled')).toBe('true');
    expect(disabled.getAttribute('tabindex')).toBe('-1');

    fireEvent.click(disabled);
    fireEvent.keyPress(disabled, { key: 'Enter', charCode: 13 });
    expect(onChange).not.toHaveBeenCalled();

    fireEvent.click(enabled);
    expect(onChange).toHaveBeenCalledWith('enabled');
  });
});
