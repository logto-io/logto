import { render, fireEvent } from '@testing-library/react';
import React from 'react';

import { defaultCountryCallingCode, countryList } from '@/hooks/use-phone-number';

import PhoneInput from './PhoneInput';

describe('Phone Input Field UI Component', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  it('render empty PhoneInput', () => {
    const { queryByText, container } = render(
      <PhoneInput name="PhoneInput" nationalNumber="" onChange={onChange} />
    );
    expect(queryByText(`+${defaultCountryCallingCode}`)).toBeNull();
    expect(container.querySelector('input')?.value).toBe('');
  });

  it('render with country list', () => {
    const { queryByText, container } = render(
      <PhoneInput
        name="PhoneInput"
        nationalNumber=""
        countryList={countryList}
        countryCallingCode={defaultCountryCallingCode}
        onChange={onChange}
      />
    );

    const countryCode = queryByText(`+${defaultCountryCallingCode}`);
    expect(countryCode).not.toBeNull();

    const selector = container.querySelector('select');
    expect(selector).not.toBeNull();

    if (selector) {
      fireEvent.change(selector, { target: { value: '1' } });
      expect(onChange).toBeCalledWith({ countryCallingCode: '1' });
    }
  });

  it('render input update', () => {
    const { container } = render(
      <PhoneInput name="PhoneInput" nationalNumber="911" onChange={onChange} />
    );

    const inputField = container.querySelector('input');
    expect(inputField?.value).toBe('911');

    if (inputField) {
      fireEvent.change(inputField, { target: { value: '110' } });
      expect(onChange).toBeCalledWith({ nationalNumber: '110' });
      fireEvent.focus(inputField);
    }
  });

  it('render input clear', () => {
    const { container } = render(
      <PhoneInput name="PhoneInput" nationalNumber="911" onChange={onChange} />
    );

    const inputField = container.querySelector('input');

    if (inputField) {
      fireEvent.focus(inputField);
    }

    const clearButton = container.querySelector('svg');
    expect(clearButton).not.toBeNull();

    if (clearButton) {
      fireEvent.mouseDown(clearButton);
      expect(onChange).toBeCalledWith({ nationalNumber: '' });
    }
  });
});
