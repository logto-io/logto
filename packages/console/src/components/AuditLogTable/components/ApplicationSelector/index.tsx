import type { Application } from '@logto/schemas';
import { adminConsoleApplicationId } from '@logto/schemas';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import Select from '@/components/Select';

type Props = {
  value?: string;
  onChange: (value?: string) => void;
};

const ApplicationSelector = ({ value, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
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
      options={[{ value: adminConsoleApplicationId, title: 'Admin Console' }, ...options]}
      placeholder={t('logs.application')}
      onChange={onChange}
    />
  );
};

export default ApplicationSelector;
