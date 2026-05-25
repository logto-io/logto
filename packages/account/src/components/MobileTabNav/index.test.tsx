import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import MobileTabNav from '.';

describe('<MobileTabNav />', () => {
  it('renders profile and security tabs when both are enabled', () => {
    render(
      <MemoryRouter>
        <MobileTabNav hasProfile hasSecurity />
      </MemoryRouter>
    );

    expect(screen.getByText('account_center.page.sidebar_personal_info')).toBeTruthy();
    expect(screen.getByText('account_center.page.sidebar_security')).toBeTruthy();
  });

  it('renders nothing when only security is available', () => {
    const { container } = render(
      <MemoryRouter>
        <MobileTabNav hasProfile={false} hasSecurity />
      </MemoryRouter>
    );

    expect(screen.queryByText('account_center.page.sidebar_security')).toBeNull();
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when only one nav item is available', () => {
    const { container } = render(
      <MemoryRouter>
        <MobileTabNav hasProfile={false} hasSecurity={false} />
      </MemoryRouter>
    );

    expect(container.firstChild).toBeNull();
  });
});
