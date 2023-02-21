import { userCloudDataKey } from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import { z } from 'zod';

import useMeCustomData from '@/hooks/use-me-custom-data';

import type { UserCloudData } from '../types';
import { userCloudDataGuard } from '../types';

const useUserCloudData = () => {
  const { data, error, isLoading, isLoaded, update: updateMeCustomData } = useMeCustomData();

  const userCloudData = useMemo(() => {
    const parsed = z.object({ [userCloudDataKey]: userCloudDataGuard }).safeParse(data);

    return parsed.success ? parsed.data.cloud : {};
  }, [data]);

  const update = useCallback(
    async (data: Partial<UserCloudData>) => {
      await updateMeCustomData({
        [userCloudDataKey]: {
          ...userCloudData,
          ...data,
        },
      });
    },
    [updateMeCustomData, userCloudData]
  );

  return { data: userCloudData, error, isLoading, isLoaded, update };
};

export default useUserCloudData;
