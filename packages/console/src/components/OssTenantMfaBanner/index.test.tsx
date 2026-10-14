import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import OssTenantMfaBanner from '.';

jest.mock('@/consts', () => ({
  adminTenantEndpoint: new URL('https://admin.example.com'),
}));

jest.mock('@/consts/env', () => ({ isCloud: false }));

jest.mock('@/hooks/use-oss-tenant-mfa', () => ({
  __esModule: true,
  default: () => ({
    data: { isMfaRequired: true, isMember: true, hasMfaConfigured: false, isAdmin: false },
  }),
}));

it('keeps Console open while the member sets up MFA in Account Center', () => {
  render(
    <MemoryRouter>
      <OssTenantMfaBanner />
    </MemoryRouter>
  );

  const link = screen.getByRole('link', { name: /tenant_mfa_setup_action/ });

  expect(link.getAttribute('href')).toBe('https://admin.example.com/account/security');
  expect(link.getAttribute('target')).toBe('_blank');
  expect(link.getAttribute('rel')).toBe('noopener noreferrer');
});
