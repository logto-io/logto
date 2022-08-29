import { render, fireEvent } from '@testing-library/react';

import { getCountryList, getDefaultCountryCallingCode } from '@/utils/country-code';

import PhoneInput from './PhoneInput';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('Phone Input Field UI Component', () => {
  const onChange = jest.fn();

  beforeEach(() => {
    onChange.mockClear();
  });

  const defaultCountryCallingCode = getDefaultCountryCallingCode();

  it('render empty PhoneInput', () => {
    const { queryByText, container } = render(
      <PhoneInput name="PhoneInput" nationalNumber="" onChange={onChange} />
    );
    expect(queryByText(`+${defaultCountryCallingCode}`)).toBeNull();
    expect(container.querySelector('input')?.value).toBe('');
  });

  it('render with country list', () => {
    const { queryAllByText, container } = render(
      <PhoneInput
        name="PhoneInput"
        nationalNumber=""
        countryList={getCountryList()}
        countryCallingCode={defaultCountryCallingCode}
        onChange={onChange}
      />
    );

    const countryCode = queryAllByText(`+${defaultCountryCallingCode}`);
    expect(countryCode).toHaveLength(2);

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

  it('render input error', () => {
    const { queryByText } = render(
      <PhoneInput
        name="PhoneInput"
        nationalNumber="110"
        error="invalid_phone"
        onChange={onChange}
      />
    );
    expect(queryByText('invalid_phone')).not.toBeNull();
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
