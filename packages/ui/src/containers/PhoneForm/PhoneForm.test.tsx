import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { getDefaultCountryCallingCode } from '@/utils/country-code';

import PhoneForm from './PhoneForm';

const onSubmit = jest.fn();
const clearErrorMessage = jest.fn();

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('<PhonePasswordless/>', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  const phoneNumber = '8573333333';
  const defaultCountryCallingCode = getDefaultCountryCallingCode();

  test('render', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <PhoneForm onSubmit={onSubmit} />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('render with terms settings', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhoneForm onSubmit={onSubmit} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('render with terms settings but hasTerms param set to false', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhoneForm hasTerms={false} onSubmit={onSubmit} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).toBeNull();
  });

  test('required phone with error message', () => {
    const { queryByText, container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <PhoneForm onSubmit={onSubmit} />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_phone')).not.toBeNull();
    expect(onSubmit).not.toBeCalled();

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: '1113' } });
      expect(queryByText('invalid_phone')).not.toBeNull();

      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
      expect(queryByText('invalid_phone')).toBeNull();
    }
  });

  test('should display and clear the form error message as expected', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <PhoneForm
          errorMessage="form error"
          clearErrorMessage={clearErrorMessage}
          onSubmit={onSubmit}
        />
      </MemoryRouter>
    );

    expect(queryByText('form error')).not.toBeNull();

    const phoneInput = container.querySelector('input[name="phone"]');

    if (phoneInput) {
      fireEvent.change(phoneInput, { target: { value: phoneNumber } });
      expect(clearErrorMessage).toBeCalled();
    }
  });

  test('should blocked by terms validation with terms settings enabled', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhoneForm onSubmit={onSubmit} />
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
      expect(onSubmit).not.toBeCalled();
    });
  });

  test('should call submit method properly with terms settings enabled but hasTerms param set to false', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhoneForm hasTerms={false} onSubmit={onSubmit} />
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
      expect(onSubmit).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
    });
  });

  test('should call submit method properly with terms settings enabled and checked', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <PhoneForm onSubmit={onSubmit} />
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
      expect(onSubmit).toBeCalledWith(`${defaultCountryCallingCode}${phoneNumber}`);
    });
  });
});
