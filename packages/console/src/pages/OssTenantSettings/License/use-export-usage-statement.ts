import { type LicenseUsageStatement } from '@logto/schemas';
import { HTTPError, TimeoutError } from 'ky';
import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import useApi from '@/hooks/use-api';
import { downloadText } from '@/utils/downloader';

import { buildUsageStatementCsv } from './utils';

const usageStatementApiPath = 'api/systems/license/usage-statement';
/**
 * Core allows the statement queries to run for 30 seconds, which is longer than the Console's
 * default request timeout; giving up at 20 seconds would fail the export of a large deployment.
 */
const usageStatementRequestTimeout = 60 * 1000;

/**
 * Export the usage statement of this deployment as a CSV, for the customer to provide to Logto as
 * the usage statement the self-hosted terms ask for.
 *
 * HTTP failures are reported by the global error handling. A timeout or a network failure never
 * reaches it, so it is reported here instead of leaving the export silently unfinished.
 */
const useExportUsageStatement = () => {
  const api = useApi({ timeout: usageStatementRequestTimeout });
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const [isExporting, setIsExporting] = useState(false);

  const exportUsageStatement = useCallback(async () => {
    setIsExporting(true);

    try {
      const { months } = await api.get(usageStatementApiPath).json<LicenseUsageStatement>();

      downloadText(
        buildUsageStatementCsv(months, {
          month: t('tenants.license.usage_statement_month_column'),
          mau: t('tenants.license.usage_mau_field'),
          monthlyAccessTokens: t('tenants.license.usage_access_tokens_field'),
        }),
        `logto-usage-statement-${new Date().toISOString().slice(0, 10)}.csv`,
        'text/csv;charset=utf-8'
      );
    } catch (error: unknown) {
      if (error instanceof HTTPError) {
        // The global error handling already told the user what went wrong.
        return;
      }

      toast.error(error instanceof TimeoutError ? error.message : t('general.unknown_error'));
    } finally {
      setIsExporting(false);
    }
  }, [api, t]);

  return { isExporting, exportUsageStatement };
};

export default useExportUsageStatement;
