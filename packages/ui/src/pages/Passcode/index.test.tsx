import { Routes, Route, MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import Passcode from '.';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    state: { email: 'foo@logto.io' },
  }),
}));

describe('Passcode Page', () => {
  it('render properly', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/email/passcode-validation']}>
        <SettingsProvider>
          <Routes>
            <Route path="/:type/:method/passcode-validation" element={<Passcode />} />
          </Routes>
        </SettingsProvider>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).not.toBeNull();
    expect(queryByText('description.enter_passcode')).not.toBeNull();
  });

  it('render with invalid method', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/sign-in/username/passcode-validation']}>
        <Routes>
          <Route path="/:type/:method/passcode-validation" element={<Passcode />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });

  it('render with invalid type', () => {
    const { queryByText } = renderWithPageContext(
      <MemoryRouter initialEntries={['/social/email/passcode-validation']}>
        <Routes>
          <Route path="/:type/:method/passcode-validation" element={<Passcode />} />
        </Routes>
      </MemoryRouter>
    );

    expect(queryByText('action.enter_passcode')).toBeNull();
    expect(queryByText('description.not_found')).not.toBeNull();
  });
});
