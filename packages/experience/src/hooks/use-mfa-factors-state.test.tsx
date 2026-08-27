import { MfaFactor } from '@logto/schemas';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import { UserMfaFlow } from '@/types';

import useMfaFlowState from './use-mfa-factors-state';

const TestHook = () => {
  const flowState = useMfaFlowState();
  return <span>{JSON.stringify(flowState)}</span>;
};

it('reads MFA flow state nested by the verification-code binding route', () => {
  const mfaFlowState = {
    availableFactors: [MfaFactor.EmailVerificationCode],
    trustedDevice: { canCreate: true, durationDays: 365 },
  };
  const { container } = render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/continue/verification-code',
          state: { flow: UserMfaFlow.MfaBinding, mfaFlowState },
        },
      ]}
    >
      <TestHook />
    </MemoryRouter>
  );

  expect(container.textContent).toBe(JSON.stringify(mfaFlowState));
});
