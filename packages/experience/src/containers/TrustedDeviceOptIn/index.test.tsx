import { MfaFactor } from '@logto/schemas';
import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { getInteraction } from '@/apis/experience';
import useTrustedDeviceOptIn, {
  isTrustedDeviceOptInEligible,
} from '@/hooks/use-trusted-device-opt-in';

import TrustedDeviceOptIn from '.';

jest.mock('@/apis/experience', () => ({
  getInteraction: jest.fn(),
}));

const mockedGetInteraction = getInteraction as jest.MockedFunction<typeof getInteraction>;

const TestOptIn = ({ factor = MfaFactor.TOTP }: { readonly factor?: MfaFactor }) => {
  const { durationDays, isChecked, setIsChecked } = useTrustedDeviceOptIn(factor);

  return (
    <TrustedDeviceOptIn durationDays={durationDays} isChecked={isChecked} onChange={setIsChecked} />
  );
};

describe('<TrustedDeviceOptIn />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('supports the eligible MFA factors and excludes backup codes', () => {
    expect(isTrustedDeviceOptInEligible(MfaFactor.TOTP)).toBe(true);
    expect(isTrustedDeviceOptInEligible(MfaFactor.WebAuthn)).toBe(true);
    expect(isTrustedDeviceOptInEligible(MfaFactor.EmailVerificationCode)).toBe(true);
    expect(isTrustedDeviceOptInEligible(MfaFactor.PhoneVerificationCode)).toBe(true);
    expect(isTrustedDeviceOptInEligible(MfaFactor.BackupCode)).toBe(false);
  });

  it('shows a default-unchecked checkbox when effective policy allows creation', async () => {
    mockedGetInteraction.mockResolvedValue({
      trustedDevice: { canCreate: true, durationDays: 30 },
    });
    const { container } = render(<TestOptIn />);

    await waitFor(() => {
      expect(container.querySelector('[role="checkbox"]')).not.toBeNull();
    });

    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox?.getAttribute('aria-checked')).toBe('false');

    act(() => {
      if (checkbox) {
        fireEvent.click(checkbox);
      }
    });

    expect(checkbox?.getAttribute('aria-checked')).toBe('true');
  });

  it('stays hidden when effective policy disallows creation', async () => {
    mockedGetInteraction.mockResolvedValue({ trustedDevice: { canCreate: false } });
    const { container } = render(<TestOptIn />);

    await waitFor(() => {
      expect(mockedGetInteraction).toBeCalled();
    });

    expect(container.querySelector('[role="checkbox"]')).toBeNull();
  });

  it('does not query availability for an ineligible backup-code screen', () => {
    render(<TestOptIn factor={MfaFactor.BackupCode} />);

    expect(mockedGetInteraction).not.toBeCalled();
  });
});
