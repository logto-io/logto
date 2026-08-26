import { MfaFactor } from '@logto/schemas';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useTrustedDeviceOptIn from './use-trusted-device-opt-in';

jest.mock('@/constants/env', () => ({
  isDevFeaturesEnabled: false,
}));

const TestHook = () => {
  const { availability } = useTrustedDeviceOptIn();
  return <span>{JSON.stringify(availability)}</span>;
};

it('ignores router-state availability when dev features are disabled', () => {
  const { container } = render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/',
          state: {
            availableFactors: [MfaFactor.TOTP],
            trustedDevice: { canCreate: true, durationDays: 30 },
          },
        },
      ]}
    >
      <TestHook />
    </MemoryRouter>
  );

  expect(container.textContent).toBe('');
});
