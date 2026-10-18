import { defaultWafConfig } from '@logto/schemas';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import type React from 'react';

import WafSettings from '.';
import useWafConfig from './use-waf-config';

jest.mock('./use-waf-config', () => ({ __esModule: true, default: jest.fn() }));
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

const updateWafConfig = jest.fn();

const setConfigs = (waf = defaultWafConfig) => {
  jest.mocked(useWafConfig).mockReturnValue({
    isLoading: false,
    data: waf,
    error: undefined,
    mutate: jest.fn(),
    updateWafConfig,
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  setConfigs();
});

describe('WAF settings', () => {
  it('shows safe defaults when no persisted config exists', () => {
    jest.mocked(useWafConfig).mockReturnValue({
      isLoading: false,
      data: undefined,
      error: undefined,
      mutate: jest.fn(),
      updateWafConfig,
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
      expect(updateWafConfig).toHaveBeenCalledWith({
        mode: 'block',
        maxRequestTargetLength: 4096,
      });
    });
  });
});
