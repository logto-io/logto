import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';
import { useForm } from 'react-hook-form';

import { type FormData } from '../utils';

import TrustedDeviceSettings from './TrustedDeviceSettings';

jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({
    children,
    title,
  }: {
    readonly children: React.ReactNode;
    readonly title: string;
  }) => (
    <label>
      {title}
      {children}
    </label>
  ),
}));

jest.mock('@/ds-components/InlineNotification', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => (
    <div role="note">{children}</div>
  ),
}));

type Props = {
  readonly isGlobalEnabled: boolean;
  readonly isInitiallyAllowed?: boolean;
  readonly onSubmit: (data: FormData) => void;
};

function TestForm({ isGlobalEnabled, isInitiallyAllowed = true, onSubmit }: Props) {
  const { register, handleSubmit } = useForm<FormData>({
    defaultValues: { isTrustedDeviceAllowed: isInitiallyAllowed },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TrustedDeviceSettings
        isGlobalPolicyLoaded
        isGlobalPolicyEnabled={isGlobalEnabled}
        register={register}
      />
      <button type="submit">Save</button>
    </form>
  );
}

describe('Organization trusted-device settings', () => {
  it('lets an organization narrow an enabled tenant policy', async () => {
    const onSubmit = jest.fn();
    render(<TestForm isGlobalEnabled onSubmit={onSubmit} />);

    const allowSwitch = screen.getByRole<HTMLInputElement>('checkbox');
    expect(allowSwitch.checked).toBe(true);

    fireEvent.click(allowSwitch);
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ isTrustedDeviceAllowed: false }),
        expect.anything()
      );
    });
  });

  it('cannot enable trusted devices while the tenant policy is off', () => {
    render(<TestForm isGlobalEnabled={false} isInitiallyAllowed={false} onSubmit={jest.fn()} />);

    const allowSwitch = screen.getByRole<HTMLInputElement>('checkbox');
    expect(allowSwitch.disabled).toBe(true);
    expect(allowSwitch.checked).toBe(false);
    expect(screen.getByRole('note').textContent).toBe(
      'admin_console.mfa.trusted_device.organization_global_disabled'
    );

    allowSwitch.click();
    expect(allowSwitch.checked).toBe(false);
  });
});
