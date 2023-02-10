import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, render } from '@testing-library/react';

import { getDefaultCountryCallingCode } from '@/utils/country-code';

import type { EnabledIdentifierTypes, IdentifierInputType } from '.';
import SmartInputField from '.';

jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

describe('SmartInputField Component', () => {
  const onChange = jest.fn();
  const onTypeChange = jest.fn();
  const defaultCountryCallingCode = getDefaultCountryCallingCode();

  const renderInputField = (props: {
    currentType: IdentifierInputType;
    enabledTypes?: EnabledIdentifierTypes;
  }) => render(<SmartInputField {...props} onTypeChange={onTypeChange} onChange={onChange} />);

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('standard input field', () => {
    it.each([SignInIdentifier.Username, SignInIdentifier.Email])(
      `should render %s input field`,
      (currentType) => {
        const { container } = renderInputField({ currentType });

        // Country code should not be rendered
        expect(container.querySelector('select')).toBeNull();

        const input = container.querySelector('input');

        if (input) {
          fireEvent.change(input, { target: { value: 'foo' } });
          expect(onChange).toBeCalledWith('foo');
          expect(onTypeChange).not.toBeCalled();

          fireEvent.change(input, { target: { value: 'foo@' } });
          expect(onChange).toBeCalledWith('foo@');
          expect(onTypeChange).not.toBeCalled();

          fireEvent.change(input, { target: { value: '12315' } });
          expect(onChange).toBeCalledWith('12315');
          expect(onTypeChange).not.toBeCalled();
        }
      }
    );

    it('phone', async () => {
      const { container, queryAllByText } = renderInputField({
        currentType: SignInIdentifier.Phone,
      });

      const countryCode = queryAllByText(`+${defaultCountryCallingCode}`);
      expect(countryCode).toHaveLength(2);

      const selector = container.querySelector('select');
      expect(selector).not.toBeNull();

      const newCountryCode = '86';

      if (selector) {
        fireEvent.change(selector, { target: { value: newCountryCode } });
        expect(onChange).toBeCalledWith(newCountryCode);
      }

      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith(`${newCountryCode}12315`);
        expect(onTypeChange).not.toBeCalled();
      }
    });
  });

  describe('username with email', () => {
    const config = {
      currentType: SignInIdentifier.Username,
      enabledTypes: [SignInIdentifier.Email, SignInIdentifier.Username],
    };

    it('should not update inputType if no @ char present', () => {
      const { container } = renderInputField(config);

      // Country code should not be rendered
      expect(container.querySelector('select')).toBeNull();

      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: 'foo' } });
        expect(onChange).toBeCalledWith('foo');
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should not update inputType to phone as phone is not enabled', () => {
      const { container } = renderInputField(config);

      // Country code should not be rendered
      expect(container.querySelector('select')).toBeNull();

      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith('12315');
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should update inputType to email with @ char', () => {
      const { container } = renderInputField(config);

      // Country code should not be rendered
      expect(container.querySelector('select')).toBeNull();

      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: 'foo@' } });
        expect(onChange).toBeCalledWith('foo@');
        expect(onTypeChange).toBeCalledWith(SignInIdentifier.Email);
      }
    });
  });

  describe('username with phone', () => {
    const config = {
      currentType: SignInIdentifier.Username,
      enabledTypes: [SignInIdentifier.Username, SignInIdentifier.Phone],
    };

    it('should not update inputType if non digit chars present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12345@' } });
        expect(onChange).toBeCalledWith('12345@');
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should not update inputType if less than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12' } });
        expect(onChange).toBeCalledWith('12');
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should update inputType to phone with more than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith(`${defaultCountryCallingCode}12315`);
        expect(onTypeChange).toBeCalledWith(SignInIdentifier.Phone);
      }
    });
  });

  describe('email with phone', () => {
    const config = {
      currentType: SignInIdentifier.Email,
      enabledTypes: [SignInIdentifier.Email, SignInIdentifier.Phone],
    };

    it('should not update inputType non digit char present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315@' } });
        expect(onChange).toBeCalledWith('12315@');
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should not update inputType if less than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12' } });
        expect(onChange).toBeCalledWith('12');
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should update inputType to phone with more than 3 digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith(`${defaultCountryCallingCode}12315`);
        expect(onTypeChange).toBeCalledWith(SignInIdentifier.Phone);
      }
    });

    it('should not update inputType if @ present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315@' } });
        expect(onChange).toBeCalledWith('12315@');
        expect(onTypeChange).not.toBeCalled();
      }
    });
  });

  describe('email with username', () => {
    const config = {
      currentType: SignInIdentifier.Email,
      enabledTypes: [SignInIdentifier.Email, SignInIdentifier.Username],
    };

    it('should not update inputType if @ present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: 'foo@' } });
        expect(onChange).toBeCalledWith('foo@');
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should update inputType to username with pure digits as phone is not enabled', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315' } });
        expect(onChange).toBeCalledWith('12315');
        expect(onTypeChange).toBeCalledWith(SignInIdentifier.Username);
      }
    });

    it('should update inputType to username with no @ present', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: 'foo' } });
        expect(onChange).toBeCalledWith('foo');
        expect(onTypeChange).toBeCalledWith(SignInIdentifier.Username);
      }
    });
  });

  describe('phone with username', () => {
    const config = {
      currentType: SignInIdentifier.Phone,
      enabledTypes: [SignInIdentifier.Phone, SignInIdentifier.Username],
    };

    it('should not update inputType if all chars are digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '123' } });
        expect(onChange).toBeCalledWith(`${defaultCountryCallingCode}123`);
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should update inputType if non digit char found', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '123@' } });
        expect(onChange).toBeCalledWith('123@');
        expect(onTypeChange).toBeCalledWith(SignInIdentifier.Username);
      }
    });
  });

  describe('phone with email', () => {
    const config = {
      currentType: SignInIdentifier.Phone,
      enabledTypes: [SignInIdentifier.Phone, SignInIdentifier.Email],
    };

    it('should not update inputType if all chars are digits', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '123' } });
        expect(onChange).toBeCalledWith(`${defaultCountryCallingCode}123`);
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should not update inputType if no all chars are digits and no @', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '123a' } });
        expect(onChange).toBeCalledWith(`${defaultCountryCallingCode}123a`);
        expect(onTypeChange).not.toBeCalled();
      }
    });

    it('should update inputType if @ char found', () => {
      const { container } = renderInputField(config);
      const input = container.querySelector('input');

      if (input) {
        fireEvent.change(input, { target: { value: '12315@' } });
        expect(onChange).toBeCalledWith('12315@');
        expect(onTypeChange).toBeCalledWith(SignInIdentifier.Email);
      }
    });
  });
});
