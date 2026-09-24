import useSWR from 'swr';
import { z } from 'zod';

import { cloudApi } from '@/consts';
import { isDevFeaturesEnabled } from '@/consts/env';
import { useStaticApi } from '@/hooks/use-api';

const statusGuard = z.object({ hasConsoleSsoConnectors: z.boolean() });

export default function useAccountDeletionStatus() {
  const api = useStaticApi({ resourceIndicator: cloudApi.indicator, hideErrorToast: true });

  // Console SSO is customer-owned and must be removed before deleting its owner.
  return useSWR<z.infer<typeof statusGuard>, Error>(
    isDevFeaturesEnabled ? '/api/me/account-deletion-status' : null,
    async (path: string) => statusGuard.parse(await api.get(path).json())
  );
}
