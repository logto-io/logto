import resources from '@logto/phrases';
import { act, renderHook } from '@testing-library/react';
import i18next from 'i18next';
import { HTTPError, TimeoutError, type KyInstance, type NormalizedOptions } from 'ky';
import { toast } from 'react-hot-toast';

import useApi from '@/hooks/use-api';
import { downloadText } from '@/utils/downloader';

import useExportUsageStatement from './use-export-usage-statement';

jest.mock('@/hooks/use-api', () => ({ __esModule: true, default: jest.fn() }));
jest.mock('@/utils/downloader', () => ({ downloadText: jest.fn() }));
jest.mock('react-hot-toast', () => ({ toast: { error: jest.fn() } }));

const json = jest.fn();
const get = jest.fn(() => ({ json }));

const exportOnce = async () => {
  const { result } = renderHook(useExportUsageStatement);

  await act(async () => {
    await result.current.exportUsageStatement();
  });

  return result;
};

const buildHttpError = () =>
  new HTTPError(
    {
      status: 500,
      statusText: '',
      clone: () => ({ json: async () => ({}) }),
    } as Response,
    {} as Request,
    {} as NormalizedOptions
  );

describe('useExportUsageStatement', () => {
  beforeAll(() => {
    i18next.addResourceBundle('en', 'translation', resources.en.translation, true);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    json.mockReset();
    jest.mocked(useApi).mockReturnValue({ get } as unknown as KyInstance);
  });

  it('exports the statement as a CSV with a timeout above the statement query budget', async () => {
    json.mockResolvedValue({ months: [{ month: '2026-09', mau: 1, monthlyAccessTokens: 2 }] });

    const result = await exportOnce();

    expect(useApi).toHaveBeenCalledWith({ timeout: 60_000 });
    expect(get).toHaveBeenCalledWith('api/systems/license/usage-statement');
    expect(downloadText).toHaveBeenCalledWith(
      'Month,Monthly active users,Monthly access tokens\n2026-09,1,2',
      expect.stringMatching(/^logto-usage-statement-\d{4}-\d{2}-\d{2}\.csv$/),
      'text/csv;charset=utf-8'
    );
    expect(result.current.isExporting).toBe(false);
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('leaves HTTP failures to the global error handling', async () => {
    json.mockRejectedValue(buildHttpError());

    const result = await exportOnce();

    expect(downloadText).not.toHaveBeenCalled();
    expect(toast.error).not.toHaveBeenCalled();
    expect(result.current.isExporting).toBe(false);
  });

  it('reports a timeout, which the global error handling does not see', async () => {
    json.mockRejectedValue(new TimeoutError({} as Request));

    const result = await exportOnce();

    expect(downloadText).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Request timed out');
    expect(result.current.isExporting).toBe(false);
  });

  it('reports a network failure, which the global error handling does not see', async () => {
    json.mockRejectedValue(new TypeError('Failed to fetch'));

    const result = await exportOnce();

    expect(downloadText).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith('Unknown error, please try again later.');
    expect(result.current.isExporting).toBe(false);
  });
});
