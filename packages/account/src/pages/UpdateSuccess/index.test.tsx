import { SignInIdentifier } from '@logto/schemas';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { accountStorage } from '@ac/utils/session-storage';

import UpdateSuccess from '.';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('@ac/components/ErrorPage', () => {
  const MockErrorPage = ({
    titleKey,
    messageKey,
    action,
  }: {
    readonly titleKey?: string;
    readonly messageKey?: string;
    readonly action?: { readonly titleKey: string; readonly onClick: () => void };
  }) => (
    <div>
      <div data-testid="title">{titleKey}</div>
      <div data-testid="message">{messageKey}</div>
      {action && (
        <button data-testid="action" onClick={action.onClick}>
          {action.titleKey}
        </button>
      )}
    </div>
  );
  return MockErrorPage;
});

const LocationSpy = () => {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
};

describe('UpdateSuccess', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        origin: 'http://localhost',
        assign: jest.fn(),
      },
    });
  });

  describe('success page text per identifier type', () => {
    it.each([
      [SignInIdentifier.Email, 'account_center.update_success.email'],
      [SignInIdentifier.Phone, 'account_center.update_success.phone'],
      [SignInIdentifier.Username, 'account_center.update_success.username'],
      ['password' as const, 'account_center.update_success.password'],
      ['totp' as const, 'account_center.update_success.totp'],
      ['totp_replaced' as const, 'account_center.update_success.totp_replaced'],
      ['backup_code' as const, 'account_center.update_success.backup_code'],
      ['passkey' as const, 'account_center.update_success.passkey'],
      ['social' as const, 'account_center.update_success.default'],
    ])('shows correct text for identifier type %s', (identifierType, expectedPrefix) => {
      renderWithPageContext(<UpdateSuccess identifierType={identifierType} />, {
        initialEntries: ['/success'],
      });

      expect(screen.getByTestId('title').textContent).toBe(`${expectedPrefix}.title`);
      expect(screen.getByTestId('message').textContent).toBe(`${expectedPrefix}.description`);
    });

    it('shows default text when identifierType is undefined', () => {
      renderWithPageContext(<UpdateSuccess />, {
        initialEntries: ['/success'],
      });

      expect(screen.getByTestId('title').textContent).toBe(
        'account_center.update_success.default.title'
      );
      expect(screen.getByTestId('message').textContent).toBe(
        'account_center.update_success.default.description'
      );
    });
  });

  describe('pending return navigates back correctly', () => {
    it('shows done button and navigates on click for social type with pending return', () => {
      accountStorage.pendingReturn.set('https://external.example.com/dashboard');
      accountStorage.showSuccess.set(true);

      renderWithPageContext(<UpdateSuccess identifierType="social" />, {
        initialEntries: ['/success'],
      });

      const actionButton = screen.getByTestId('action');
      expect(actionButton).toBeTruthy();

      fireEvent.click(actionButton);

      expect(window.location.assign).toHaveBeenCalledWith('https://external.example.com/dashboard');
    });

    it('shows done button and navigates on click when showSuccess is true', () => {
      accountStorage.pendingReturn.set('https://external.example.com/return');
      accountStorage.showSuccess.set(true);

      renderWithPageContext(<UpdateSuccess identifierType="password" />, {
        initialEntries: ['/success'],
      });

      const actionButton = screen.getByTestId('action');
      expect(actionButton).toBeTruthy();

      fireEvent.click(actionButton);

      expect(window.location.assign).toHaveBeenCalledWith('https://external.example.com/return');
    });

    it('auto-redirects without showing done button when showSuccess is false', async () => {
      accountStorage.pendingReturn.set('https://external.example.com/auto');

      renderWithPageContext(<UpdateSuccess identifierType="password" />, {
        initialEntries: ['/success'],
      });

      await waitFor(() => {
        expect(window.location.assign).toHaveBeenCalledWith('https://external.example.com/auto');
      });
    });
  });

  describe('internal route restore', () => {
    it('navigates internally when pending return is a same-origin account center URL', () => {
      accountStorage.pendingReturn.set('http://localhost/account/security');

      renderWithPageContext(
        <Routes>
          <Route path="/success" element={<UpdateSuccess identifierType="password" />} />
          <Route path="/security" element={<LocationSpy />} />
        </Routes>,
        {
          initialEntries: ['/success'],
        }
      );

      expect(mockNavigate).toHaveBeenCalledWith('/security', { replace: true });
      expect(window.location.assign).not.toHaveBeenCalled();
    });
  });

  describe('fallback navigation', () => {
    it('shows no done button when there is no pending return', () => {
      renderWithPageContext(<UpdateSuccess identifierType="password" />, {
        initialEntries: ['/success'],
      });

      expect(screen.queryByTestId('action')).toBeNull();
      expect(window.location.assign).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
