import { render, screen } from '@testing-library/react';
import { forwardRef, type ReactNode } from 'react';
import { useForm, FormProvider } from 'react-hook-form';

import type { SignInExperienceForm } from '../../../types';

import HideLogtoBrandingField from './HideLogtoBrandingField';

jest.mock('@/components/FeatureTag', () => ({
  CloudTag: ({ children }: { readonly children: ReactNode }) => <span>{children}</span>,
  __esModule: true,
}));

jest.mock('@/ds-components/TextLink', () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
  }: {
    readonly children: ReactNode;
    readonly href?: string;
    readonly className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

jest.mock('@/ds-components/DynamicT', () => ({
  __esModule: true,
  default: ({ forKey }: { readonly forKey: string }) =>
    forKey === 'sign_in_exp.custom_ui.cloud_tag' ? 'Cloud' : forKey,
}));

jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({ title, children }: { readonly title: ReactNode; readonly children: ReactNode }) => (
    <section>
      <div>{title}</div>
      <div>{children}</div>
    </section>
  ),
}));

jest.mock('@/ds-components/Switch', () => ({
  __esModule: true,
  default: forwardRef<
    HTMLInputElement,
    {
      readonly label: ReactNode;
      readonly disabled: boolean;
    }
  >(({ label, disabled, ...rest }, ref) => (
    <label>
      <span>{label}</span>
      <input ref={ref} {...rest} disabled={disabled} type="checkbox" />
    </label>
  )),
}));

function TestForm({
  variant,
  isEnabledInCloud = false,
}: {
  readonly variant: 'cloud' | 'oss';
  readonly isEnabledInCloud?: boolean;
}) {
  const methods = useForm<SignInExperienceForm>({
    defaultValues: {
      hideLogtoBranding: false,
    },
  });

  return (
    <FormProvider {...methods}>
      <HideLogtoBrandingField variant={variant} isEnabledInCloud={isEnabledInCloud} />
    </FormProvider>
  );
}

describe('HideLogtoBrandingField', () => {
  it('renders an OSS upsell field with a disabled switch', () => {
    const { container } = render(<TestForm variant="oss" />);

    expect(screen.getByText('Cloud')).toBeTruthy();

    const checkbox = container.querySelector('input[type="checkbox"]');

    expect(checkbox).toBeTruthy();
    expect((checkbox as HTMLInputElement).disabled).toBe(true);
    expect((checkbox as HTMLInputElement).checked).toBe(false);
  });

  it('keeps the cloud switch enabled state driven by the subscription quota', () => {
    const { container } = render(<TestForm isEnabledInCloud variant="cloud" />);

    const checkbox = container.querySelector('input[type="checkbox"]');

    expect(checkbox).toBeTruthy();
    expect((checkbox as HTMLInputElement).disabled).toBe(false);
  });
});
