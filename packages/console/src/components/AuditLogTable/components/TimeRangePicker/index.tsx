import { format } from 'date-fns';
import type { ChangeEventHandler } from 'react';
import { useTranslation } from 'react-i18next';

import Select from '@/ds-components/Select';
import TextInput from '@/ds-components/TextInput';

import styles from './index.module.scss';
import { type PresetRange, customRange, isPresetRange } from './preset';

type Props = {
  /** Either a preset name (`'7d'`) or `'custom'` when a custom range is active. */
  readonly value: PresetRange | typeof customRange;
  readonly customStartDate?: string;
  readonly customEndDate?: string;
  readonly onChange: (next: { range: PresetRange | typeof customRange }) => void;
  readonly onCustomDatesChange: (next: { startDate?: string; endDate?: string }) => void;
};

/**
 * Time-range picker for the Audit Logs page. Renders a preset dropdown with an
 * optional pair of date inputs when the custom-range option is selected. URL
 * state ownership belongs to the parent — this component is purely a
 * controlled view over the `range` / `start_time` / `end_time` query params.
 */
function TimeRangePicker({
  value,
  customStartDate,
  customEndDate,
  onChange,
  onCustomDatesChange,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // I18n keys must be literals.
  const options = [
    { value: '1h', title: t('logs.last_1_hour') },
    { value: '1d', title: t('logs.last_24_hours') },
    { value: '7d', title: t('logs.last_7_days') },
    { value: '30d', title: t('logs.last_30_days') },
    { value: customRange, title: t('logs.custom_range') },
  ];

  const handleSelectChange = (next?: string) => {
    if (!next) {
      return;
    }
    if (next === customRange) {
      onChange({ range: customRange });
      return;
    }
    if (isPresetRange(next)) {
      onChange({ range: next });
    }
  };

  const today = format(Date.now(), 'yyyy-MM-dd');

  const handleStartDateChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onCustomDatesChange({ startDate: event.target.value || undefined });
  };

  const handleEndDateChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onCustomDatesChange({ endDate: event.target.value || undefined });
  };

  return (
    <div className={styles.timeRangePicker}>
      <div className={styles.selectWrapper}>
        <Select<string>
          value={value}
          options={options}
          size="medium"
          onChange={handleSelectChange}
        />
      </div>
      {value === customRange && (
        <div className={styles.customRange}>
          <label className={styles.dateField}>
            <span className={styles.dateLabel}>{t('logs.from')}</span>
            <TextInput
              type="date"
              max={today}
              value={customStartDate ?? ''}
              onChange={handleStartDateChange}
            />
          </label>
          <label className={styles.dateField}>
            <span className={styles.dateLabel}>{t('logs.to')}</span>
            <TextInput
              type="date"
              max={today}
              value={customEndDate ?? ''}
              onChange={handleEndDateChange}
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default TimeRangePicker;
