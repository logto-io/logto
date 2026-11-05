import { fireEvent } from '@testing-library/react';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';

import ContinueToApp from '.';

const replace = jest.fn();
const originalLocation = window.location;

beforeAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', { value: { replace }, writable: true });
});

afterAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutating-methods
  Object.defineProperty(window, 'location', { value: originalLocation });
});

describe('ContinueToApp', () => {
  it('should redirect to the original URL only after the user taps continue', () => {
    const redirectTo = 'https://logto.dev/oidc/auth/foo';
    const { getByText } = renderWithPageContext(<ContinueToApp />, {
      initialEntries: [{ pathname: '/continue-to-app', state: { redirectTo } }],
    });

    expect(getByText('description.continue_to_app_title')).not.toBeNull();
    expect(replace).not.toHaveBeenCalled();

    fireEvent.click(getByText('action.continue'));

    expect(replace).toHaveBeenCalledWith(redirectTo);
  });

  it('should show an error page without a redirect URL', () => {
    const { queryByText } = renderWithPageContext(<ContinueToApp />, {
      initialEntries: ['/continue-to-app'],
    });

    expect(queryByText('error.invalid_session')).not.toBeNull();
    expect(queryByText('action.continue')).toBeNull();
  });
});
