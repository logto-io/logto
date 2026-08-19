import { act, fireEvent, render, waitFor } from '@testing-library/react';

import { getInteraction } from '@/apis/experience';
import useTrustedDeviceOptIn from '@/hooks/use-trusted-device-opt-in';

import TrustedDeviceOptIn from '.';

jest.mock('@/apis/experience', () => ({
  getInteraction: jest.fn(),
}));

const mockedGetInteraction = getInteraction as jest.MockedFunction<typeof getInteraction>;

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

describe('<TrustedDeviceOptIn />', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows a default-unchecked checkbox when effective policy allows creation', async () => {
    mockedGetInteraction.mockResolvedValue({
      trustedDevice: { canCreate: true, durationDays: 30 },
    });
    const { container } = render(<TestOptIn />);

    await waitFor(() => {
      expect(container.querySelector('[role="checkbox"]')).not.toBeNull();
    });
    expect(mockedGetInteraction).toBeCalledWith(expect.any(AbortSignal));

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

  it('stays hidden when availability cannot be loaded', async () => {
    mockedGetInteraction.mockRejectedValue(new Error('Request failed'));
    const { container } = render(<TestOptIn />);

    await waitFor(() => {
      expect(container.firstElementChild).toBeNull();
    });
  });

  it('stays hidden when an available policy does not include a duration', async () => {
    mockedGetInteraction.mockResolvedValue({ trustedDevice: { canCreate: true } });
    const { container } = render(<TestOptIn />);

    await waitFor(() => {
      expect(container.firstElementChild).toBeNull();
    });
  });

  it('reserves the checkbox space while availability is loading', () => {
    mockedGetInteraction.mockReturnValue(
      new Promise(() => {
        // Keep the request pending to verify the loading placeholder.
      })
    );
    const { container } = render(<TestOptIn />);

    expect(container.firstElementChild).not.toBeNull();
    expect(container.querySelector('[role="checkbox"]')).toBeNull();
  });

  it('does not query availability when the calling page is invalid', () => {
    render(<TestOptIn isEnabled={false} />);

    expect(mockedGetInteraction).not.toBeCalled();
  });
});
