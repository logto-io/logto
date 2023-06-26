import { type JsonObject } from '@logto/schemas';
import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import useCurrentUser from './use-current-user';

const useMeCustomData = () => {
  const { user, isLoading, error, reload, api } = useCurrentUser();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const update = useCallback(
    async (customData: JsonObject) => {
      if (!user) {
        toast.error(t('errors.unexpected_error'));
        return;
      }

      await reload({
        ...user,
        customData: await api
          .patch(`me/custom-data`, {
            json: customData,
          })
          .json<JsonObject>(),
      });
    },
    [api, reload, t, user]
  );

  return {
    data: user?.customData,
    error,
    isLoading,
    isLoaded: !isLoading && !error,
    update,
  };
};

export default useMeCustomData;
