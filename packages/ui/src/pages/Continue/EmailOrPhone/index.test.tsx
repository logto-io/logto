import { MemoryRouter, Routes, Route } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';
import SettingsProvider from '@/__mocks__/RenderWithPageContext/SettingsProvider';

import EmailOrPhone from '.';

jest.mock('i18next', () => ({
  language: 'en',
}));

describe('EmailOrPhone', () => {
  it('render set phone with email alterations', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/continue/email-or-phone/phone']}>
          <Routes>
            <Route path="/continue/email-or-phone/:method" element={<EmailOrPhone />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(queryByText('description.link_email_or_phone')).not.toBeNull();
    expect(queryByText('description.link_email_or_phone_description')).not.toBeNull();
    expect(container.querySelector('input[name="phone"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
    expect(queryByText('action.switch_to')).not.toBeNull();
  });

  it('render set email with phone alterations', () => {
    const { queryByText, container } = renderWithPageContext(
      <SettingsProvider>
        <MemoryRouter initialEntries={['/continue/email-or-phone/email']}>
          <Routes>
            <Route path="/continue/email-or-phone/:method" element={<EmailOrPhone />} />
          </Routes>
        </MemoryRouter>
      </SettingsProvider>
    );

    expect(queryByText('description.link_email_or_phone')).not.toBeNull();
    expect(queryByText('description.link_email_or_phone_description')).not.toBeNull();
    expect(container.querySelector('input[name="email"]')).not.toBeNull();
    expect(queryByText('action.continue')).not.toBeNull();
    expect(queryByText('action.switch_to')).not.toBeNull();
  });
});
