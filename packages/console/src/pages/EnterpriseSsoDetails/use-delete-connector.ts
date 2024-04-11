import { useCallback, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useSWRConfig } from 'swr';

import useApi from '@/hooks/use-api';
import useTenantPathname from '@/hooks/use-tenant-pathname';

import { enterpriseSsoPathname } from './config';

function useDeleteConnector(ssoConnectorId?: string) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const [isDeleted, setIsDeleted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const api = useApi();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { navigate } = useTenantPathname();

  const onDeleteHandler = useCallback(async () => {
    if (!ssoConnectorId || isDeleting) {
      return;
    }

    setIsDeleting(true);

    try {
      await api.delete(`api/sso-connectors/${ssoConnectorId}`);
      setIsDeleted(true);

      toast.success(t('enterprise_sso_details.enterprise_sso_deleted'));

      // Reset the sso-connectors data to refresh the list.
      await mutateGlobal('api/sso-connectors');

      navigate(enterpriseSsoPathname, { replace: true });
    } finally {
      setIsDeleting(false);
    }
  }, [api, isDeleting, mutateGlobal, navigate, ssoConnectorId, t]);

  return {
    isDeleted,
    isDeleting,
    onDeleteHandler,
  };
}

export default useDeleteConnector;
