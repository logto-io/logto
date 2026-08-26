import { MfaFactor } from '@logto/schemas';
import { act, fireEvent, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import useTrustedDeviceOptIn from '@/hooks/use-trusted-device-opt-in';
import { type TrustedDeviceAvailability } from '@/types/guard';

import TrustedDeviceOptIn from '.';

const TestOptIn = ({ isEnabled = true }: { readonly isEnabled?: boolean }) => {
  const { availability, isLoading, isChecked, setIsChecked } = useTrustedDeviceOptIn(isEnabled);

  return (
    <TrustedDeviceOptIn
      availability={availability}
      isLoading={isLoading}
      isChecked={isChecked}
      onChange={setIsChecked}
    />
  );
};

const renderOptIn = (trustedDevice?: TrustedDeviceAvailability, isEnabled = true) =>
  render(
    <MemoryRouter
      initialEntries={[
        {
          pathname: '/',
          state: {
            availableFactors: [MfaFactor.TOTP],
            trustedDevice,
          },
        },
      ]}
    >
      <TestOptIn isEnabled={isEnabled} />
    </MemoryRouter>
  );

describe('<TrustedDeviceOptIn />', () => {
  it('shows a default-unchecked checkbox when MFA flow state allows creation', () => {
    const { container } = renderOptIn({ canCreate: true, durationDays: 30 });
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

  it('stays hidden when MFA flow state disallows creation', () => {
    const { container } = renderOptIn({ canCreate: false });

    expect(container.querySelector('[role="checkbox"]')).toBeNull();
  });

  it('stays hidden when MFA flow state has no availability', () => {
    const { container } = renderOptIn();

    expect(container.firstElementChild).toBeNull();
  });

  it('stays hidden when an available policy does not include a duration', () => {
    const { container } = renderOptIn({ canCreate: true });

    expect(container.firstElementChild).toBeNull();
  });

  it('stays hidden when the calling page is invalid', () => {
    const { container } = renderOptIn({ canCreate: true, durationDays: 30 }, false);

    expect(container.firstElementChild).toBeNull();
  });
});
