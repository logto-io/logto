import { Project } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createContext, type ReactNode } from 'react';

import OssOnboarding from '.';
import type { OssOnboardingFormData } from './utils';

const mockUseOssOnboardingData = jest.fn();
const mockUseTenantPathname = jest.fn();
const mockSubmitOssOnboarding = jest.fn();

function mockCreateAppThemeContext() {
  return createContext({
    theme: 'light',
    setAppearanceMode: jest.fn(),
    setThemeOverride: jest.fn(),
  });
}

jest.mock('@/contexts/AppThemeProvider', () => ({
  __esModule: true,
  AppThemeContext: mockCreateAppThemeContext(),
}));

jest.mock('@/hooks/use-oss-onboarding-data', () => ({
  __esModule: true,
  default: () => mockUseOssOnboardingData(),
}));

jest.mock('@/hooks/use-tenant-pathname', () => ({
  __esModule: true,
  default: () => mockUseTenantPathname(),
}));

jest.mock('./submit-oss-onboarding', () => ({
  __esModule: true,
  submitOssOnboarding: (...args: unknown[]) => mockSubmitOssOnboarding(...args),
}));

jest.mock('@/ds-components/OverlayScrollbar', () => ({
  __esModule: true,
  default: ({ children, ...props }: { children: ReactNode }) => <div {...props}>{children}</div>,
}));

jest.mock('@/components/PageMeta', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/utils/form', () => ({
  __esModule: true,
  trySubmitSafe: <T extends (...arguments_: unknown[]) => unknown>(handler: T) => handler,
}));

jest.mock('@/ds-components/FormField', () => ({
  __esModule: true,
  default: ({ children, title }: { children: ReactNode; title?: string }) => (
    <div>
      {title && <div>{title}</div>}
      {children}
    </div>
  ),
}));

jest.mock('@/ds-components/Checkbox', () => ({
  __esModule: true,
  default: ({
    checked,
    label,
    onChange,
  }: {
    checked?: boolean;
    label?: ReactNode;
    onChange: (value: boolean) => void;
  }) => (
    <button
      aria-checked={checked}
      role="checkbox"
      type="button"
      onClick={() => {
        onChange(!checked);
      }}
    >
      {label}
    </button>
  ),
}));

describe('OssOnboarding page', () => {
  beforeEach(() => {
    mockUseOssOnboardingData.mockReturnValue({
      data: { questionnaire: { project: Project.Personal } },
      error: undefined,
      isLoading: false,
      isLoaded: true,
      isOnboardingDone: false,
      update: jest.fn(),
    });
    mockUseTenantPathname.mockReturnValue({
      getTo: (to: string) => to,
      navigate: jest.fn(),
    });
    mockSubmitOssOnboarding.mockResolvedValue(undefined);
  });

  afterEach(() => {
    mockUseOssOnboardingData.mockReset();
    mockUseTenantPathname.mockReset();
    mockSubmitOssOnboarding.mockReset();
  });

  it('shows the newsletter checkbox only when the email address is valid', async () => {
    render(<OssOnboarding />);

    await waitFor(() => {
      expect(screen.getAllByRole('textbox').length).toBe(1);
    });

    const emailInput = screen.getByRole('textbox');

    expect(screen.queryByRole('checkbox')).toBeNull();

    fireEvent.change(emailInput, { target: { value: 'not-an-email' } });
    expect(screen.queryByRole('checkbox')).toBeNull();

    fireEvent.change(emailInput, { target: { value: 'dev@example.com' } });

    await waitFor(() => {
      expect(screen.queryByRole('checkbox')).not.toBeNull();
    });

    fireEvent.change(emailInput, { target: { value: '' } });

    await waitFor(() => {
      expect(screen.queryByRole('checkbox')).toBeNull();
    });
  });

  it('submits the current form values when the email is valid', async () => {
    render(<OssOnboarding />);

    await waitFor(() => {
      expect(screen.getAllByRole('textbox').length).toBe(1);
    });

    const emailInput = screen.getByRole('textbox');

    fireEvent.change(emailInput, { target: { value: 'dev@example.com' } });

    await waitFor(() => {
      expect(screen.queryByRole('checkbox')).not.toBeNull();
    });

    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(mockSubmitOssOnboarding).toHaveBeenCalled();
    });

    const [[payload]] = mockSubmitOssOnboarding.mock.calls as [
      [{ formData: OssOnboardingFormData }],
    ];

    expect(payload.formData.emailAddress).toBe('dev@example.com');
    expect(payload.formData.newsletter).toBe(true);
    expect(payload.formData.project).toBe(Project.Personal);
  });
});
