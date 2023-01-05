import { MemoryRouter } from 'react-router-dom';

import renderWithPageContext from '@/__mocks__/RenderWithPageContext';

import PasswordlessSwitch from '.';

describe('<PasswordlessSwitch />', () => {
  test('render phone passwordless switch', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/phone']}>
        <PasswordlessSwitch target="email" />
      </MemoryRouter>
    );

    expect(queryByText('action.switch_to')).not.toBeNull();
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/forgot-password/email');
  });

  test('render email passwordless switch', () => {
    const { queryByText, container } = renderWithPageContext(
      <MemoryRouter initialEntries={['/forgot-password/email']}>
        <PasswordlessSwitch target="phone" />
      </MemoryRouter>
    );

    expect(queryByText('action.switch_to')).not.toBeNull();
    expect(container.querySelector('a')?.getAttribute('href')).toBe('/forgot-password/phone');
  });
});
