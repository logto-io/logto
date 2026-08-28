import { MfaFactor } from '@logto/schemas';
import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useTrustedDeviceOptIn from '@/hooks/use-trusted-device-opt-in';
import { type TrustedDeviceAvailability } from '@/types/guard';

import TrustedDeviceOptIn from '.';

const TestOptIn = ({ isEnabled = true }: { readonly isEnabled?: boolean }) => {
  const { durationDays, isChecked, setIsChecked } = useTrustedDeviceOptIn(isEnabled);

  return (
    <TrustedDeviceOptIn durationDays={durationDays} isChecked={isChecked} onChange={setIsChecked} />
  );
};

const renderOptIn = (
  trustedDevice?: TrustedDeviceAvailability,
  isEnabled = true,
  additionalState: Record<string, unknown> = {}
) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/',
          state: {
            availableFactors: [MfaFactor.TOTP],
            trustedDevice,
            ...additionalState,
          },
        },
      ]}
    >
      <TestOptIn isEnabled={isEnabled} />
    </MemoryRouter>
  );

describe('<TrustedDeviceOptIn />', () => {
  it('shows a default-unchecked checkbox when MFA flow state allows creation', () => {
    const { container } = renderOptIn({
      canCreate: true,
      durationDays: 30,
      creationRequested: false,
    });
    const checkbox = container.querySelector('[role="checkbox"]');

    expect(checkbox).not.toBeNull();
    expect(checkbox?.getAttribute('aria-checked')).toBe('false');

    act(() => {
      if (checkbox) {
        fireEvent.click(checkbox);
      }
    });

    expect(checkbox?.getAttribute('aria-checked')).toBe('true');
  });

  it('shows the checkbox when WebAuthn options are included in route state', () => {
    const { container } = renderOptIn(
      { canCreate: true, durationDays: 365, creationRequested: false },
      true,
      {
        options: { challenge: 'challenge' },
      }
    );

    expect(container.querySelector('[role="checkbox"]')).not.toBeNull();
  });

  it('stays hidden when MFA flow state disallows creation', () => {
    const { container } = renderOptIn({ canCreate: false, creationRequested: false });

    expect(container.querySelector('[role="checkbox"]')).toBeNull();
  });

  it('stays hidden when MFA flow state has no availability', () => {
    const { container } = renderOptIn();

    expect(container.firstElementChild).toBeNull();
  });

  it('stays hidden when an available policy does not include a duration', () => {
    const { container } = renderOptIn({ canCreate: true, creationRequested: false });

    expect(container.firstElementChild).toBeNull();
  });

  it('stays hidden when the calling page is invalid', () => {
    const { container } = renderOptIn(
      { canCreate: true, durationDays: 30, creationRequested: false },
      false
    );

    expect(container.firstElementChild).toBeNull();
  });
});
