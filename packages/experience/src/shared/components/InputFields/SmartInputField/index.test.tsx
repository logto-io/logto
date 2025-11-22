import { SignInIdentifier } from '@logto/schemas';
import { Globals } from '@react-spring/web';
import { assert } from '@silverhand/essentials';
import { act, fireEvent, render } from '@testing-library/react';

import { getBoundingClientRectMock } from '@/__mocks__/logto';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import type { IdentifierInputType } from '.';
import SmartInputField from '.';

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

describe('SmartInputField Component', () => {
  const onChange = jest.fn();

  const defaultCountryCallingCode = getDefaultCountryCallingCode();

  const renderInputField = (props: {
    defaultValue?: string;
    defaultType?: IdentifierInputType;
    enabledTypes?: IdentifierInputType[];
  }) => render(<SmartInputField {...props} onChange={onChange} />);

  beforeAll(() => {
    Globals.assign({
      skipAnimation: true,
    });

    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.HTMLDivElement.prototype.getBoundingClientRect = getBoundingClientRectMock({
      width: 100,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('standard input field', () => {
    test.each([SignInIdentifier.Username, SignInIdentifier.Email])(
      `should render %s input field`,
      async (currentType) => {
        const { container, queryByTestId } = renderInputField({ enabledTypes: [currentType] });

        // Country code select should have a 0 width
        expect(queryByTestId('prefix')?.style.width).toBe('0px');

        const input = container.querySelector('input');

        if (input) {
          fireEvent.change(input, { target: { value: 'foo' } });
          expect(onChange).toBeCalledWith({ type: currentType, value: 'foo' });

          fireEvent.change(input, { target: { value: 'foo@' } });
          expect(onChange).toBeCalledWith({ type: currentType, value: 'foo@' });

          fireEvent.change(input, { target: { value: '12315' } });
          expect(onChange).toBeCalledWith({ type: currentType, value: '12315' });
        }
      }
    );

    test('phone', async () => {
      const { container, getByText, queryByTestId } = renderInputField({
        enabledTypes: [SignInIdentifier.Phone],
      });

      const countryCode = getByText(`+${defaultCountryCallingCode}`);
      expect(countryCode).not.toBeNull();

      expect(queryByTestId('prefix')?.style.width).toBe('100px');

      act(() => {
        fireEvent.click(countryCode);
      });

      const newCountryCode = '86';

      // Expect country code modal shown
      const newCodeButton = getByText(`+${newCountryCode}`);
      fireEvent.click(newCodeButton);

      expect(onChange).toBeCalledWith({
        type: SignInIdentifier.Phone,
        value: '',
      });

      const input = container.querySelector('input');
      assert(input, new Error('input should not be null'));

      fireEvent.change(input, { target: { value: '12315' } });
      expect(onChange).toBeCalledWith({
        type: SignInIdentifier.Phone,
        value: `${newCountryCode}12315`,
      });
    });
  });

  describe('username with email', () => {
    const config = {
      enabledTypes: [SignInIdentifier.Email, SignInIdentifier.Username],
    };

    test('should  return username type if no @ char present', async () => {
      const { container, queryByTestId } = renderInputField(config);

      // Country code select should have a 0 width
      expect(queryByTestId('prefix')?.style.width).toBe('0px');

      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: 'foo' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Username, value: 'foo' });
      }
    });

    test('should return username type with all digits input', async () => {
      const { container, queryByTestId } = renderInputField(config);

      // Country code select should have a 0 width
      expect(queryByTestId('prefix')?.style.width).toBe('0px');

      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Username, value: '12315' });
      }
    });

    test('should return email type with @ char', async () => {
      const { container, queryByTestId } = renderInputField(config);

      // Country code select should have a 0 width
      expect(queryByTestId('prefix')?.style.width).toBe('0px');

      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: 'foo@' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Email, value: 'foo@' });
      }
    });
  });

  describe('username with phone', () => {
    const config = {
      enabledTypes: [SignInIdentifier.Username, SignInIdentifier.Phone],
    };

    test('should return username type if non digit chars present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12345@' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Username, value: '12345@' });
      }
    });

    test('should return username type if less than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Username, value: '12' });
      }
    });

    test('should return phone type with more than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith({
          type: SignInIdentifier.Phone,
          value: `${defaultCountryCallingCode}12315`,
        });
      }
    });
  });

  describe('email with phone', () => {
    const config = {
      enabledTypes: [SignInIdentifier.Email, SignInIdentifier.Phone],
    };

    test('should return email type if non digit char present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315a' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Email, value: '12315a' });
      }
    });

    test('should return email type if less than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Email, value: '12' });
      }
    });

    test('should update inputType to phone with more than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith({
          type: SignInIdentifier.Phone,
          value: `${defaultCountryCallingCode}12315`,
        });
      }
    });

    test('should return email type if @ present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315@' } });
        expect(onChange).toBeCalledWith({ type: SignInIdentifier.Email, value: '12315@' });
      }
    });
  });

  describe('username, email and phone', () => {
    const config = {
      enabledTypes: [SignInIdentifier.Username, SignInIdentifier.Email, SignInIdentifier.Phone],
    };

    test('should call onChange properly based on different inputs', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      assert(input, new Error('Input field not found'));
      expect(onChange).toBeCalledWith({ type: undefined, value: '' });

      fireEvent.change(input, { target: { value: 'foo' } });
      expect(onChange).toBeCalledWith({ type: SignInIdentifier.Username, value: 'foo' });

      fireEvent.change(input, { target: { value: 'foo@' } });
      expect(onChange).toBeCalledWith({ type: SignInIdentifier.Email, value: 'foo@' });

      fireEvent.change(input, { target: { value: '11' } });
      expect(onChange).toBeCalledWith({ type: SignInIdentifier.Username, value: '11' });

      fireEvent.change(input, { target: { value: '110' } });
      expect(onChange).toBeCalledWith({
        type: SignInIdentifier.Phone,
        value: `${defaultCountryCallingCode}110`,
      });

      fireEvent.change(input, { target: { value: '11' } });
      expect(onChange).toBeCalledWith({
        type: SignInIdentifier.Phone,
        value: `${defaultCountryCallingCode}11`,
      });

      fireEvent.change(input, { target: { value: '11@' } });
      expect(onChange).toBeCalledWith({
        type: SignInIdentifier.Email,
        value: `11@`,
      });
    });
  });
});
