import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Select from '@/components/Select';

type Props = {
  value?: string[];
  onChange?: (value: string[]) => void;
};

const roleDefault = 'default';
const roleAdmin = 'admin';

const RoleSelect = ({ value, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const options = useMemo(
    () => [
      { value: roleDefault, title: t('user_details.roles.default') },
      { value: roleAdmin, title: t('user_details.roles.admin') },
    ],
    [t]
  );

  const selectValue = useMemo(() => {
    if (!value?.length) {
      return roleDefault;
    }

    if (value.length === 1 && value[0] === 'admin') {
      return roleAdmin;
    }

    throw new Error('Unsupported user role value');
  }, [value]);

  const handleChange = (value: string) => {
    onChange?.(value === roleAdmin ? ['admin'] : []);
  };

  return <Select options={options} value={selectValue} onChange={handleChange} />;
};

export default RoleSelect;
