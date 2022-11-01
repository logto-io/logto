import { fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { sendRegisterEmailPasscode } from '@/apis/register';
import { sendSignInEmailPasscode } from '@/apis/sign-in';
import { UserFlow } from '@/types';

import EmailPasswordless from './EmailPasswordless';

jest.mock('@/apis/sign-in', () => ({
  sendSignInEmailPasscode: jest.fn(async () => 0),
}));
jest.mock('@/apis/register', () => ({
  sendRegisterEmailPasscode: jest.fn(async () => 0),
}));

describe('<EmailPasswordless/>', () => {
  test('render', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter>
        <EmailPasswordless type={UserFlow.signIn} />
      </MemoryRouter>
    );
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  test('render with terms settings', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type={UserFlow.signIn} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).not.toBeNull();
  });

  test('render with terms settings but hasTerms param set to false', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type={UserFlow.signIn} hasTerms={false} />
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(queryByText('description.terms_of_use')).toBeNull();
  });

  test('required email with error message', () => {
    const { queryByText, container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <EmailPasswordless type={UserFlow.signIn} />
      </MemoryRouter>
    );
    const submitButton = getByText('action.continue');

    fireEvent.click(submitButton);
    expect(queryByText('invalid_email')).not.toBeNull();
    expect(sendSignInEmailPasscode).not.toBeCalled();

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo' } });
      expect(queryByText('invalid_email')).not.toBeNull();

      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
      expect(queryByText('invalid_email')).toBeNull();
    }
  });

  test('should blocked by terms validation with terms settings enabled', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type={UserFlow.signIn} />
        </SettingsProvider>
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).not.toBeCalled();
    });
  });

  test('should call sign-in method properly with terms settings enabled but hasTerms param set to false', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type={UserFlow.signIn} hasTerms={false} />
        </SettingsProvider>
      </MemoryRouter>
    );

    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).toBeCalledWith('foo@logto.io');
    });
  });

  test('should call sign-in method properly with terms settings enabled and checked', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type={UserFlow.signIn} />
        </SettingsProvider>
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendSignInEmailPasscode).toBeCalledWith('foo@logto.io');
    });
  });

  test('should call register method properly if type is register', async () => {
    const { container, getByText } = renderWithPageContext(
      <MemoryRouter>
        <SettingsProvider>
          <EmailPasswordless type={UserFlow.register} />
        </SettingsProvider>
      </MemoryRouter>
    );
    const emailInput = container.querySelector('input[name="email"]');

    if (emailInput) {
      fireEvent.change(emailInput, { target: { value: 'foo@logto.io' } });
    }

    const termsButton = getByText('description.agree_with_terms');
    fireEvent.click(termsButton);

    const submitButton = getByText('action.continue');

    act(() => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(sendRegisterEmailPasscode).toBeCalledWith('foo@logto.io');
    });
  });
});
