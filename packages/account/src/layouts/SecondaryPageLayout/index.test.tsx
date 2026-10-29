import { fireEvent, screen } from '@testing-library/react';
import { Route, Routes } from 'react-router-dom';

import renderWithPageContext from '@ac/__mocks__/RenderWithPageContext';
import { accountStorage } from '@ac/utils/session-storage';

import SecondaryPageLayout from '.';

const mockAssign = jest.fn();
const mockBack = jest.fn();

const renderPasswordFlow = () =>
  renderWithPageContext(
    <Routes>
      <Route
        path="/password"
        element={
          <SecondaryPageLayout title="account_center.password.title">
            <div>Password form</div>
          </SecondaryPageLayout>
        }
      />
      <Route path="/profile" element={<div>Profile page</div>} />
    </Routes>,
    { initialEntries: ['/password'] }
  );

describe('SecondaryPageLayout back navigation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.clearAllMocks();
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { origin: 'http://localhost', assign: mockAssign },
    });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    window.history.back = mockBack;
  });

  it('returns to the redirect URL and clears it so a later flow does not complete into it', () => {
    accountStorage.pendingReturn.set('https://app.example.com/settings');
    accountStorage.showSuccess.set(true);
    renderPasswordFlow();

    fireEvent.click(screen.getByRole('button'));

    expect(mockAssign).toHaveBeenCalledWith('https://app.example.com/settings');
    expect(mockBack).not.toHaveBeenCalled();
    expect(accountStorage.pendingReturn.get()).toBeUndefined();
    expect(accountStorage.showSuccess.get()).toBe(false);
  });

  it('navigates in place to an Account Center redirect URL', () => {
    accountStorage.pendingReturn.set('http://localhost/account/profile');
    renderPasswordFlow();

    fireEvent.click(screen.getByRole('button'));

    expect(screen.getByText('Profile page')).toBeTruthy();
    expect(mockAssign).not.toHaveBeenCalled();
  });

  it('goes back in history without a redirect URL', () => {
    renderPasswordFlow();

    fireEvent.click(screen.getByRole('button'));

    expect(mockBack).toHaveBeenCalled();
    expect(mockAssign).not.toHaveBeenCalled();
  });
});
