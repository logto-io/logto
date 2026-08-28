import { MfaFactor } from '@logto/schemas';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { UserMfaFlow } from '@/types';

import useMfaFlowState from './use-mfa-factors-state';

const TestHook = () => {
  const flowState = useMfaFlowState();
  return <span>{JSON.stringify(flowState)}</span>;
};

it('reads and masks MFA flow state nested by the verification-code binding route', () => {
  const mfaFlowState = {
    availableFactors: [MfaFactor.EmailVerificationCode],
    trustedDevice: { canCreate: true, durationDays: 365, creationRequested: false },
  };
  const { container } = render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/continue/verification-code',
          state: {
            flow: UserMfaFlow.MfaBinding,
            mfaFlowState: { ...mfaFlowState, futureField: 'ignored' },
          },
        },
      ]}
    >
      <TestHook />
    </MemoryRouter>
  );

  expect(container.textContent).toBe(JSON.stringify(mfaFlowState));
});

it('masks page-specific fields from direct MFA flow state', () => {
  const mfaFlowState = {
    availableFactors: [MfaFactor.TOTP, MfaFactor.WebAuthn],
    trustedDevice: { canCreate: true, durationDays: 30, creationRequested: false },
  };
  const { container } = render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/mfa-binding/totp',
          state: {
            ...mfaFlowState,
            secret: 'secret',
            secretQrCode: 'data:image/png;base64,qr-code',
          },
        },
      ]}
    >
      <TestHook />
    </MemoryRouter>
  );

  expect(container.textContent).toBe(JSON.stringify(mfaFlowState));
});
