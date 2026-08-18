import { MfaPolicy } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type * as React from 'react';
import { useForm } from 'react-hook-form';

import { type MfaConfigForm } from '../types';

import TrustedDeviceSettings from './TrustedDeviceSettings';

jest.mock('@/components/FormCard', () => ({
  __esModule: true,
  default: ({ children }: { readonly children: React.ReactNode }) => <section>{children}</section>,
}));

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

const defaultValues: MfaConfigForm = {
  totpEnabled: true,
  webAuthnEnabled: false,
  backupCodeEnabled: false,
  emailVerificationCodeEnabled: false,
  phoneVerificationCodeEnabled: false,
  isMandatory: false,
  setUpPrompt: MfaPolicy.NoPrompt,
  organizationRequiredMfaPolicy: undefined,
  adaptiveMfaEnabled: false,
  trustedDeviceEnabled: false,
  trustedDeviceDurationDays: 30,
};

type Props = {
  readonly isDisabled?: boolean;
  readonly onSubmit: (data: MfaConfigForm) => void;
};

function TestForm({ isDisabled = false, onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MfaConfigForm>({ defaultValues, mode: 'onChange' });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TrustedDeviceSettings isDisabled={isDisabled} register={register} errors={errors} />
      <button type="submit">Save</button>
    </form>
  );
}

describe('TrustedDeviceSettings', () => {
  it('edits and submits trusted-device policy values', async () => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    const enableSwitch = screen.getByRole<HTMLInputElement>('checkbox');
    const durationInput = screen.getByRole<HTMLInputElement>('spinbutton');

    expect(enableSwitch.checked).toBe(false);
    expect(durationInput.value).toBe('30');
    expect(screen.getByRole('note').textContent).toBe(
      'admin_console.mfa.trusted_device.duration_note'
    );

    fireEvent.click(enableSwitch);
    fireEvent.change(durationInput, { target: { value: '365' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          trustedDeviceEnabled: true,
          trustedDeviceDurationDays: 365,
        }),
        expect.anything()
      );
    });
  });

  it.each(['', '0', '1.5', '366'])('rejects an invalid trust duration of %p', async (value) => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(screen.getByText('admin_console.mfa.trusted_device.duration_error')).toBeTruthy();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it.each(['1', '365'])('accepts the trust duration boundary %s', async (value) => {
    const onSubmit = jest.fn();
    render(<TestForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value } });
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ trustedDeviceDurationDays: Number(value) }),
        expect.anything()
      );
    });
  });

  it('disables policy controls with the parent MFA policy state', () => {
    render(<TestForm isDisabled onSubmit={jest.fn()} />);

    expect(screen.getByRole<HTMLInputElement>('checkbox').disabled).toBe(true);
    expect(screen.getByRole<HTMLInputElement>('spinbutton').disabled).toBe(true);
  });
});
