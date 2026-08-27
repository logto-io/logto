import { SignInIdentifier } from '@logto/schemas';
import { render } from '@testing-library/react';

import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { type IdentifierInputValue } from '@/shared/components/InputFields/SmartInputField';

import HiddenIdentifierInput from './HiddenIdentifierInput';

type ContextValue = {
  identifierInputValue?: IdentifierInputValue;
  forgotPasswordIdentifierInputValue?: IdentifierInputValue;
};

const renderWithIdentifier = (contextValue: ContextValue, isForgotPassword = false) =>
  render(
    <UserInteractionContext.Provider value={contextValue as UserInteractionContextType}>
      <HiddenIdentifierInput isForgotPassword={isForgotPassword} />
    </UserInteractionContext.Provider>
  );

describe('<HiddenIdentifierInput />', () => {
  test('renders nothing without a cached identifier', () => {
    const { container } = renderWithIdentifier({});
    expect(container.querySelector('input')).toBeNull();
  });

  test.each([
    [SignInIdentifier.Email, 'foo@logto.io'],
    [SignInIdentifier.Phone, '18888888888'],
    [SignInIdentifier.Username, 'foo'],
  ])('renders the username context for %s', (type, value) => {
    const { container } = renderWithIdentifier({ identifierInputValue: { type, value } });
    const input = container.querySelector('input');

    expect(input).not.toBeNull();
    // The `autocomplete="username"` attribute is required by browsers to detect the username
    // context of the new password field, otherwise no strong password will be suggested.
    expect(input?.getAttribute('autocomplete')).toBe('username');
    expect(input?.getAttribute('name')).toBe('username');
    expect(input?.getAttribute('type')).toBe('text');
    expect(input?.value).toBe(value);
    // Some browsers skip fields hidden by the `hidden` attribute when detecting the context.
    expect(input?.hasAttribute('hidden')).toBe(false);
  });

  test('reads the forgot password identifier in a reset password flow', () => {
    const { container } = renderWithIdentifier(
      {
        identifierInputValue: { type: SignInIdentifier.Email, value: 'alice@logto.io' },
        forgotPasswordIdentifierInputValue: {
          type: SignInIdentifier.Email,
          value: 'bob@logto.io',
        },
      },
      true
    );

    expect(container.querySelector('input')?.value).toBe('bob@logto.io');
  });

  test('renders nothing in a reset password flow without a forgot password identifier', () => {
    const { container } = renderWithIdentifier(
      { identifierInputValue: { type: SignInIdentifier.Email, value: 'alice@logto.io' } },
      true
    );

    expect(container.querySelector('input')).toBeNull();
  });
});
