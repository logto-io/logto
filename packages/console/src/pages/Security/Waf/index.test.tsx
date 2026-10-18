import { defaultWafConfig } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';

import useConfigs from '@/hooks/use-configs';

import WafSettings from '.';

jest.mock('@/hooks/use-configs', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/scss/modal.module.scss', () => ({}));
jest.mock('@withtyped/client', () => ({ ResponseError: class extends Error {} }), {
  virtual: true,
});
jest.mock('@/hooks/use-current-tenant-scopes', () => ({
  __esModule: true,
  default: () => ({ access: { isReadOnly: false } }),
}));
jest.mock('@/hooks/use-tenant-pathname', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/components/FeatureTag', () => ({
  __esModule: true,
  default: () => null,
  BetaTag: () => null,
  CombinedAddOnAndFeatureTag: () => null,
}));
jest.mock('@/components/RequestDataError', () => ({ __esModule: true, default: () => null }));
jest.mock('@/components/UnsavedChangesAlertModal', () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock('@/ds-components/Select', () => ({
  __esModule: true,
  default: ({
    value,
    options,
    onChange,
  }: {
    value?: string;
    options: Array<{ value: string; title: React.ReactNode }>;
    onChange?: (value: string) => void;
  }) => (
    <select value={value} onChange={(event) => onChange?.(event.target.value)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.title}
        </option>
      ))}
    </select>
  ),
}));

const updateConfigs = jest.fn();
const baseConfigs = {
  signInExperienceCustomized: false,
  organizationCreated: false,
};

const setConfigs = (waf = defaultWafConfig) => {
  jest.mocked(useConfigs).mockReturnValue({
    isLoading: false,
    configs: { ...baseConfigs, waf },
    error: undefined,
    mutate: jest.fn(),
    updateConfigs,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  setConfigs();
});

describe('WAF settings', () => {
  it('shows safe defaults when no persisted config exists', () => {
    jest.mocked(useConfigs).mockReturnValue({
      isLoading: false,
      configs: baseConfigs,
      error: undefined,
      mutate: jest.fn(),
      updateConfigs,
    });

    render(<WafSettings />);

    expect(screen.getByRole<HTMLSelectElement>('combobox').value).toBe('report');
    expect(screen.getByRole<HTMLInputElement>('spinbutton').value).toBe('8192');
  });

  it('saves mode and request-target limit at runtime', async () => {
    render(<WafSettings />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'block' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '4096' } });
    fireEvent.click(screen.getByRole('button', { name: 'admin_console.general.save_changes' }));

    await waitFor(() => {
      expect(updateConfigs).toHaveBeenCalledWith({
        waf: { mode: 'block', maxRequestTargetLength: 4096 },
      });
    });
  });
});
