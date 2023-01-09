import { Routes, Route, MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import VerificationCode from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    state: { email: 'foo@logto.io' },
  }),
}));

describe('VerificationCode Page', () => {
  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email/verification-code']}>
        <SettingsProvider>
          <Routes>
            <Route path="/:type/:method/verification-code" element={<VerificationCode />} />
          </Routes>
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).not.toBeNull();
    expect(queryByText('description.enter_passcode')).not.toBeNull();
  });

  it('render with invalid method', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/username/verification-code']}>
        <Routes>
          <Route path="/:type/:method/verification-code" element={<VerificationCode />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  it('render with invalid type', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/social/email/verification-code']}>
        <Routes>
          <Route path="/:type/:method/verification-code" element={<VerificationCode />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
