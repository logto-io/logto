import { toast } from 'react-hot-toast';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type InvoicesResponse } from '@/cloud/types/router';
import { isCloud, isProduction } from '@/consts/env';

const useInvoices = (tenantId: string) => {
  const cloudApi = useCloudApi();
  const swrResponse = useSWR<InvoicesResponse, Error>(
    /**
     * Todo: @xiaoyijun remove this condition on subscription features ready.
     */
    !isProduction && isCloud && `/api/tenants/${tenantId}/invoices`,
    async () => cloudApi.get('/api/tenants/:tenantId/invoices', { params: { tenantId } }),
    {
      onError: (error: unknown) => {
        toast.error(error instanceof Error ? error.message : String(error));
      },
    }
  );

  const { data: invoicesResponse } = swrResponse;

  return {
    ...swrResponse,
    data: invoicesResponse?.invoices,
  };
};

export default useInvoices;
