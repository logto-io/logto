import { fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';
import { mockSignInExperienceSettings } from '@/__mocks__/logto';

import PasswordlessSwitch from './PasswordlessSwitch';

const mockedNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

describe('<PasswordlessSwitch />', () => {
  afterEach(() => {
    mockedNavigate.mockClear();
  });

  test('render sms passwordless switch', () => {
    const { queryByText, getByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/sms']}>
        <SettingsProvider>
          <PasswordlessSwitch target="email" />
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(queryByText('action.switch_to')).not.toBeNull();

    const link = getByText('action.switch_to');
    fireEvent.click(link);

    expect(mockedNavigate).toBeCalledWith({ pathname: '/forgot-password/email' });
  });

  test('render email passwordless switch', () => {
    const { queryByText, getByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/email']}>
        <SettingsProvider>
          <PasswordlessSwitch target="sms" />
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(queryByText('action.switch_to')).not.toBeNull();

    const link = getByText('action.switch_to');
    fireEvent.click(link);

    expect(mockedNavigate).toBeCalledWith({ pathname: '/forgot-password/sms' });
  });

  test('should not render the switch if SIE setting does not has the supported sign in method', () => {
    const { queryByText, getByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/email']}>
        <SettingsProvider
          settings={{
            ...mockSignInExperienceSettings,
            primarySignInMethod: 'username',
            secondarySignInMethods: ['email', 'social'],
          }}
        >
          <PasswordlessSwitch target="sms" />
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(queryByText('action.switch_to')).toBeNull();
  });
});
