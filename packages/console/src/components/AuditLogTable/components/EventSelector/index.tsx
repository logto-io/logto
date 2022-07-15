import { useTranslation } from 'react-i18next';

import Select from '@/components/Select';
import { logEventTitle } from '@/consts/logs';

type Props = {
  value?: string;
  onChange: (value?: string) => void;
};

const EventSelector = ({ value, onChange }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const options = Object.entries(logEventTitle).map(([value, title]) => ({
    value,
    title,
  }));

  return (
    <Select
      isClearable
      value={value}
      options={options}
      placeholder={t('logs.event')}
      onChange={onChange}
    />
  );
};

export default EventSelector;
