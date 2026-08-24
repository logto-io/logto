import { SignInIdentifier } from '@logto/schemas';
import { render } from '@testing-library/react';

import UserInteractionContext, {
  type UserInteractionContextType,
} from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { type IdentifierInputValue } from '@/shared/components/InputFields/SmartInputField';

import HiddenIdentifierInput from './HiddenIdentifierInput';

const renderWithIdentifier = (identifierInputValue?: IdentifierInputValue) =>
  render(
    <UserInteractionContext.Provider value={{ identifierInputValue } as UserInteractionContextType}>
      <HiddenIdentifierInput />
    </UserInteractionContext.Provider>
  );

describe('<HiddenIdentifierInput />', () => {
  test('renders nothing without a cached identifier', () => {
    const { container } = renderWithIdentifier();
    expect(container.querySelector('input')).toBeNull();
  });

  test.each([
    [SignInIdentifier.Email, 'foo@logto.io', 'email'],
    [SignInIdentifier.Phone, '18888888888', 'tel'],
    [SignInIdentifier.Username, 'foo', 'text'],
  ])('renders the username context for %s', (type, value, expectedInputType) => {
    const { container } = renderWithIdentifier({ type, value });
    const input = container.querySelector('input');

    expect(input).not.toBeNull();
    // The `autocomplete="username"` attribute is required by browsers to detect the username
    // context of the new password field, otherwise no strong password will be suggested.
    expect(input?.getAttribute('autocomplete')).toBe('username');
    expect(input?.getAttribute('name')).toBe('username');
    expect(input?.getAttribute('type')).toBe(expectedInputType);
    expect(input?.value).toBe(value);
    // Some browsers skip fields hidden by the `hidden` attribute when detecting the context.
    expect(input?.hasAttribute('hidden')).toBe(false);
  });
});
