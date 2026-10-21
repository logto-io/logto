import { fireEvent } from '@testing-library/react';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { accountCenterBasePath } from '@ac/utils/account-center-route';
import { unmetAuthenticationRequirementsError } from '@ac/utils/step-up';

import StepUpFailure from '.';

const mockReplace = jest.fn();

describe('<StepUpFailure />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, replace: mockReplace },
    });
  });

  it('returns to the account root for an entry-guard failure', () => {
    const { getByText } = renderWithPageContext(
      <StepUpFailure
        failure={{
          error: unmetAuthenticationRequirementsError,
          route: '/account/password',
          action: { type: 'enter-subpage' },
        }}
      />
    );

    fireEvent.click(getByText('action.back'));

    expect(mockReplace).toHaveBeenCalledWith(accountCenterBasePath);
  });

  it('returns to the original route for an action failure', () => {
    const { getByText } = renderWithPageContext(
      <StepUpFailure
        failure={{
          error: 'access_denied',
          route: '/account/security',
          action: { type: 'remove-username' },
        }}
      />
    );

    fireEvent.click(getByText('action.back'));

    expect(mockReplace).toHaveBeenCalledWith('/account/security');
  });
});
