import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { sendRegisterSmsPasscode } from '@/apis/register';
import { sendSignInSmsPasscode } from '@/apis/sign-in';
import { UserFlow } from '@/types';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import PhonePasswordless from './PhonePasswordless';

jest.mock('@/apis/sign-in', () => ({
  sendSignInSmsPasscode: jest.fn(async () => 0),
}));
jest.mock('@/apis/register', () => ({
  sendRegisterSmsPasscode: jest.fn(async () => 0),
}));
jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<PhonePasswordless/>', () => {
  const phoneNumber = '8573333333';
  const defaultCountryCallingCode = getDefaultCountryCallingCode();

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <PhonePasswordless type={UserFlow.signIn} />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('render with terms settings', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type={UserFlow.signIn} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('render with terms settings but hasTerms param set to false', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type={UserFlow.signIn} hasTerms={false} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).toBeNull();
  });

  test('required phone with error message', () => {
    const { queryByText, container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhonePasswordless type={UserFlow.signIn} />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_phone')).not.toBeNull();
    expect(sendSignInSmsPasscode).not.toBeCalled();

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: '1113' } });
      expect(queryByText('invalid_phone')).not.toBeNull();

      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
      expect(queryByText('invalid_phone')).toBeNull();
    }
  });

  test('should blocked by terms validation with terms settings enabled', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type={UserFlow.signIn} />
        </SettingsProvider>
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInSmsPasscode).not.toBeCalled();
    });
  });

  test('should call sign-in method properly with terms settings enabled but hasTerms param set to false', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type={UserFlow.signIn} hasTerms={false} />
        </SettingsProvider>
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInSmsPasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
    });
  });

  test('should call sign-in method properly with terms settings enabled and checked', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type={UserFlow.signIn} />
        </SettingsProvider>
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInSmsPasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
    });
  });

  test('should call register method properly if type is register', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhonePasswordless type={UserFlow.register} />
        </SettingsProvider>
      </MemoryRouter>
    );
    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendRegisterSmsPasscode).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
    });
  });
});
