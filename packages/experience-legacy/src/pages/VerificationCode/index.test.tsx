import { SignInIdentifier } from '@logto/schemas';
import { renderHook } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { remove } from 'tiny-cookie';

import UserInteractionContextProvider from '@/Providers/UserInteractionContextProvider';
import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

import VerificationCode from '.';

describe('VerificationCode Page', () => {
  const { result } = renderHook(() => useSessionStorage());
  const { set } = result.current;

  beforeEach(() => {
    set(StorageKeys.IdentifierInputValue, { type: SignInIdentifier.Email, value: 'foo@logto.io' });
  });

  afterEach(() => {
    remove(StorageKeys.IdentifierInputValue);
  });

  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <UserInteractionContextProvider>
          <Routes>
            <Route path="/:flow/verification-code" element={<VerificationCode />} />
          </Routes>
        </UserInteractionContextProvider>
      </SettingsProvider>,
      { initialEntries: ['/sign-in/verification-code'] }
    );

    expect(queryByText('description.verify_email')).not.toBeNull();
    expect(queryByText('description.enter_passcode')).not.toBeNull();
  });

  it('render with invalid flow', () => {
    const { queryByText } = renderWithPageContext(
      <Routes>
        <Route path="/:flow/verification-code" element={<VerificationCode />} />
      </Routes>,
      { initialEntries: ['/social/verification-code'] }
    );

    expect(queryByText('action.enter_passcode')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
