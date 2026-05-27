import { render, screen } from '@testing-library/react';

import { AccountLayoutProvider } from '@ac/Providers/AccountLayoutContext';

import AccountPageHeader from '.';

describe('<AccountPageHeader />', () => {
  it('renders title and description when mobile tab nav is hidden', () => {
    render(
      <AccountLayoutProvider value={{ showsMultiPageNav: false, showsMobileTabNav: false }}>
        <AccountPageHeader
          titleKey="account_center.page.security_title"
          descriptionKey="account_center.page.security_description"
        />
      </AccountLayoutProvider>
    );

    expect(screen.getByText('account_center.page.security_title')).toBeTruthy();
    expect(screen.getByText('account_center.page.security_description')).toBeTruthy();
  });

  it('renders title and description on desktop when multi-page nav is shown', () => {
    render(
      <AccountLayoutProvider value={{ showsMultiPageNav: true, showsMobileTabNav: false }}>
        <AccountPageHeader
          titleKey="account_center.page.profile_title"
          descriptionKey="account_center.page.profile_description"
        />
      </AccountLayoutProvider>
    );

    expect(screen.getByText('account_center.page.profile_title')).toBeTruthy();
    expect(screen.getByText('account_center.page.profile_description')).toBeTruthy();
  });

  it('hides title and description when mobile tab nav is shown', () => {
    render(
      <AccountLayoutProvider value={{ showsMultiPageNav: true, showsMobileTabNav: true }}>
        <AccountPageHeader
          titleKey="account_center.page.profile_title"
          descriptionKey="account_center.page.profile_description"
        />
      </AccountLayoutProvider>
    );

    expect(screen.queryByText('account_center.page.profile_title')).toBeNull();
    expect(screen.queryByText('account_center.page.profile_description')).toBeNull();
  });
});
