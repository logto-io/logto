import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { act, waitFor, fireEvent } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { fulfillProfile } from '@/apis/experience';

import SetUsername from '.';

const mockedNavigate = jest.fn();

// PhoneNum CountryCode detection
jest.mock('i18next', () => ({
  language: 'en',
  t: (key: string) => key,
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

jest.mock('@/apis/experience', () => ({
  fulfillProfile: jest.fn(async () => ({ redirectTo: '/' })),
}));

describe('SetUsername', () => {
  it('render SetUsername page properly', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <SetUsername interactionEvent={InteractionEvent.Register} />
      </SettingsProvider>
    );
    expect(container.querySelector('input[name="identifier"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
  });

  it('should submit properly', async () => {
    const { getByText, container } = renderWithPageContext(
      <SettingsProvider>
        <SetUsername interactionEvent={InteractionEvent.Register} />
      </SettingsProvider>
    );
    const submitButton = getByText('action.continue');
    const usernameInput = container.querySelector('input[name="identifier"]');

    act(() => {
      if (usernameInput) {
        fireEvent.change(usernameInput, { target: { value: 'username' } });
      }

      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(fulfillProfile).toBeCalledWith(
        { type: SignInIdentifier.Username, value: 'username' },
        InteractionEvent.Register
      );
    });
  });
});
