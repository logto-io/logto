import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { buildAccountNavItems } from '../account-nav-items';

import MobileTabNav from '.';

describe('<MobileTabNav />', () => {
  it('renders profile and security tabs when both are enabled', () => {
    const items = buildAccountNavItems({ hasProfile: true, hasSecurity: true, hasSessions: false });

    render(
      <MemoryRouter>
        <MobileTabNav items={items} />
      </MemoryRouter>
    );

    expect(screen.getByText('account_center.page.sidebar_personal_info')).toBeTruthy();
    expect(screen.getByText('account_center.page.sidebar_security')).toBeTruthy();
  });

  it('renders nothing when only security is available', () => {
    const items = buildAccountNavItems({
      hasProfile: false,
      hasSecurity: true,
      hasSessions: false,
    });
    const { container } = render(
      <MemoryRouter>
        <MobileTabNav items={items} />
      </MemoryRouter>
    );

    expect(screen.queryByText('account_center.page.sidebar_security')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when only one nav item is available', () => {
    const { container } = render(
      <MemoryRouter>
        <MobileTabNav items={[]} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
