import {
  handleAccountCenterRoute,
  setRouteRestore,
  getPendingReturn,
} from './account-center-route';
import { accountStorage } from './session-storage';

const setLocation = (pathname: string, search = '', origin = 'http://localhost') => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {
      pathname,
      search,
      hash: '',
      origin,
    },
  });
};

const mockReplaceState = jest.fn();

describe('account-center-route', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.history.replaceState = mockReplaceState;
  });

  describe('handleAccountCenterRoute – route restore', () => {
    it('restores a stored known route when landing on the base path', () => {
      accountStorage.routeRestore.set('/account/security');
      setLocation('/account');

      handleAccountCenterRoute();

      expect(mockReplaceState).toHaveBeenCalledWith({}, '', '/account/security');
    });

    it('clears the stored route after restoration (one-time use)', () => {
      accountStorage.routeRestore.set('/account/security');
      setLocation('/account');

      handleAccountCenterRoute();

      expect(accountStorage.routeRestore.get()).toBeUndefined();
    });

    it('does not restore when landing on a non-base path', () => {
      accountStorage.routeRestore.set('/account/security');
      setLocation('/account/email');

      handleAccountCenterRoute();

      expect(mockReplaceState).not.toHaveBeenCalled();
    });

    it('does not restore when no route is stored', () => {
      setLocation('/account');

      handleAccountCenterRoute();

      expect(mockReplaceState).not.toHaveBeenCalled();
    });

    it('skips handling when search contains ?code= (auth callback)', () => {
      accountStorage.routeRestore.set('/account/security');
      setLocation('/account', '?code=abc123');

      handleAccountCenterRoute();

      expect(mockReplaceState).not.toHaveBeenCalled();
    });

    it('skips handling when search contains ?error= (auth error)', () => {
      accountStorage.routeRestore.set('/account/security');
      setLocation('/account', '?error=login_required');

      handleAccountCenterRoute();

      expect(mockReplaceState).not.toHaveBeenCalled();
    });

    it('parses and stores the redirect query parameter as pending return', () => {
      setLocation('/account/email', '?redirect=https%3A%2F%2Fexample.com%2Fdashboard');

      handleAccountCenterRoute();

      expect(getPendingReturn()).toBe('https://example.com/dashboard');
    });

    it('does not store redirect query parameter on account center tab routes', () => {
      setLocation(
        '/account/security',
        '?redirect=https%3A%2F%2Fexample.com%2Fdashboard&show_success=1'
      );

      handleAccountCenterRoute();

      expect(getPendingReturn()).toBeUndefined();
      expect(accountStorage.showSuccess.get()).toBe(false);
    });

    it('stores show_success flag from query parameters', () => {
      setLocation('/account/email', '?redirect=https%3A%2F%2Fexample.com&show_success=1');

      handleAccountCenterRoute();

      expect(accountStorage.showSuccess.get()).toBe(true);
    });

    it('ignores invalid redirect URLs', () => {
      setLocation('/account/email', '?redirect=not-a-valid-url');

      handleAccountCenterRoute();

      expect(getPendingReturn()).toBeUndefined();
    });
  });

  describe('setRouteRestore', () => {
    it('stores known routes', () => {
      setRouteRestore('/account/security');
      expect(accountStorage.routeRestore.get()).toBe('/account/security');
    });

    it('stores email route', () => {
      setRouteRestore('/account/email');
      expect(accountStorage.routeRestore.get()).toBe('/account/email');
    });

    it('stores password route', () => {
      setRouteRestore('/account/password');
      expect(accountStorage.routeRestore.get()).toBe('/account/password');
    });

    it('stores sessions route', () => {
      setRouteRestore('/account/sessions');
      expect(accountStorage.routeRestore.get()).toBe('/account/sessions');
    });

    it('does not store unknown routes', () => {
      setRouteRestore('/account/unknown-page');
      expect(accountStorage.routeRestore.get()).toBeUndefined();
    });

    it('does not store routes outside account center', () => {
      setRouteRestore('/admin/dashboard');
      expect(accountStorage.routeRestore.get()).toBeUndefined();
    });
  });
});
