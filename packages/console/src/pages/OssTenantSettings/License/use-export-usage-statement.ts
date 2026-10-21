import { type LicenseUsageStatement } from '@logto/schemas';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import useApi from '@/hooks/use-api';
import { downloadText } from '@/utils/downloader';

import { buildUsageStatementCsv } from './utils';

const usageStatementApiPath = 'api/systems/license/usage-statement';

/**
 * Export the usage statement of this deployment as a CSV, for the customer to provide to Logto as
 * the usage statement the self-hosted terms ask for.
 *
 * A failed export is a server or transport problem, which the global error handling already
 * reports, so nothing is shown here beyond the loading state.
 */
const useExportUsageStatement = () => {
  const api = useApi();
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
    } catch {
      // The global error handling already tells the user what went wrong.
    } finally {
      setIsExporting(false);
    }
  }, [api, t]);

  return { isExporting, exportUsageStatement };
};

export default useExportUsageStatement;
