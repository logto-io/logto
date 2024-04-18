import { useTranslation } from 'react-i18next';

import { logEventTitle } from '@/consts/logs';
import Select, { type Option } from '@/ds-components/Select';

type Props = {
  readonly value?: string;
  readonly onChange: (value?: string) => void;
  readonly options?: Array<Option<string>>;
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
