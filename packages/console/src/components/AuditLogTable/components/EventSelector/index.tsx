import { useTranslation } from 'react-i18next';

import Select, { type Option } from '@/components/Select';
import { logEventTitle } from '@/consts/logs';

type Props = {
  value?: string;
  onChange: (value?: string) => void;
  options?: Array<Option<string>>;
};

const defaultEventOptions = Object.entries(logEventTitle).map(([value, title]) => ({
  value,
  title: title ?? value,
}));

function EventSelector({ value, onChange, options }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Select
      isClearable
      value={value}
      options={options ?? defaultEventOptions}
      placeholder={t('logs.event')}
      onChange={onChange}
    />
  );
}

export default EventSelector;
