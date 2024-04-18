import type { Application } from '@logto/schemas';
import { adminConsoleApplicationId, adminTenantId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import { isCloud } from '@/consts/env';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Select from '@/ds-components/Select';

type Props = {
  readonly value?: string;
  readonly onChange: (value?: string) => void;
};

function ApplicationSelector({ value, onChange }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { currentTenantId } = useContext(TenantsContext);
  const { data } = useSWR<Application[]>('api/applications');
  const options =
    data?.map(({ id, name }) => ({
      value: id,
      title: name,
    })) ?? [];

  return (
    <Select
      isClearable
      value={value}
      options={[
        ...(conditional(
          isCloud &&
            currentTenantId === adminTenantId && [
              { value: adminConsoleApplicationId, title: 'Admin Console' },
            ]
        ) ?? []),
        ...options,
      ]}
      placeholder={t('logs.application')}
      onChange={onChange}
    />
  );
}

export default ApplicationSelector;
