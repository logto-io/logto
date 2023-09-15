import { Routes, Route } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import VerificationCode from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    state: { identifier: 'email', value: 'foo@logto.io' },
  }),
}));

describe('VerificationCode Page', () => {
  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <SettingsProvider>
        <Routes>
          <Route path="/:flow/verification-code" element={<VerificationCode />} />
        </Routes>
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
