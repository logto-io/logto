import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { defaultCountryCallingCode } from '@/hooks/use-phone-number';

import PhoneInputProvider from '.';

describe('Phone Input Provider', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('render with empty input', () => {
    const { queryByText } = render(
      <PhoneInputProvider name="phone" value="" onChange={onChange} />
    );

    expect(queryByText(`+${defaultCountryCallingCode}`)).not.toBeNull();
  });

  it('render with input', () => {
    const { queryByText, container } = render(
      <PhoneInputProvider name="phone" value="+1911" onChange={onChange} />
    );

    expect(queryByText('+1')).not.toBeNull();
    expect(container.querySelector('input')?.value).toEqual('911');
  });

  it('update country code', () => {
    const { container } = render(
      <PhoneInputProvider name="phone" value="+1911" onChange={onChange} />
    );

    const selector = container.querySelector('select');

    if (selector) {
      fireEvent.change(selector, { target: { value: '86' } });
      expect(onChange).toBeCalledWith('+86911');
    }
  });

  it('update national code', () => {
    const { container } = render(
      <PhoneInputProvider name="phone" value="+1911" onChange={onChange} />
    );

    const input = container.querySelector('input');

    if (input) {
      fireEvent.change(input, { target: { value: '119' } });
      expect(onChange).toBeCalledWith('+1119');
    }
  });

  it('clear national code', () => {
    const { container } = render(
      <PhoneInputProvider name="phone" value="+1911" onChange={onChange} />
    );

    const input = container.querySelector('input');

    if (!input) {
      return;
    }

    fireEvent.focus(input);

    const clearButton = container.querySelectorAll('svg');
    expect(clearButton).toHaveLength(2);

    if (clearButton[1]) {
      fireEvent.mouseDown(clearButton[1]);
      expect(onChange).toBeCalledWith('+1');
    }
  });
});
