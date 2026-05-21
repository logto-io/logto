import { format, isValid, parseISO, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

import DatePicker from '@/ds-components/DatePicker';
import Select from '@/ds-components/Select';

import styles from './index.module.scss';
import { type PresetRange, customRange, isDateInputValue, isPresetRange } from './preset';

type Props = {
  /** Either a preset name (`'7d'`) or `'custom'` when a custom range is active. */
  readonly value: PresetRange | typeof customRange;
  readonly customStartDate?: string;
  readonly customEndDate?: string;
  readonly onChange: (next: { range: PresetRange | typeof customRange }) => void;
  readonly onCustomDatesChange: (next: { startDate?: string; endDate?: string }) => void;
};

/** URL ↔ `Date` conversion. The `DatePicker` ds-component speaks only `Date`. */
const parseDateInputValue = (raw?: string): Date | undefined => {
  if (!raw || !isDateInputValue(raw)) {
    return undefined;
  }
  const parsed = parseISO(raw);
  return isValid(parsed) ? parsed : undefined;
};

const toDateInputValue = (date: Date | undefined): string | undefined =>
  date ? format(startOfDay(date), 'yyyy-MM-dd') : undefined;

/**
 * Audit Logs time-range picker. Controlled view over the `range` /
 * `start_time` / `end_time` query params — URL state lives in the parent.
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

  // Recompute every render. A `useMemo([])` here would freeze `today` on the
  // mount day, and the Audit Logs tab is commonly left open for days —
  // freezing would lock out the actual current day until remount.
  // `react-day-picker` matches dates by value rather than identity, so
  // identity churn is harmless.
  const today = startOfDay(new Date());
  const startDate = parseDateInputValue(customStartDate);
  const endDate = parseDateInputValue(customEndDate);

  const handleStartDateChange = (next: Date | undefined) => {
    onCustomDatesChange({ startDate: toDateInputValue(next) });
  };

  const handleEndDateChange = (next: Date | undefined) => {
    onCustomDatesChange({ endDate: toDateInputValue(next) });
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
          <div className={styles.dateField}>
            <span className={styles.dateLabel}>{t('logs.from')}</span>
            <DatePicker
              ariaLabel={t('logs.from')}
              value={startDate}
              // Cap the start date by the (already-picked) end date so the
              // user can't choose a window where end < start. `endDate` is
              // itself capped at today, so this also covers the future-day
              // case when no end date is set yet.
              max={endDate ?? today}
              todayLabel={t('general.today')}
              clearLabel={t('general.clear')}
              onChange={handleStartDateChange}
            />
          </div>
          <div className={styles.dateField}>
            <span className={styles.dateLabel}>{t('logs.to')}</span>
            <DatePicker
              ariaLabel={t('logs.to')}
              value={endDate}
              // Floor the end date at the (already-picked) start date.
              min={startDate}
              max={today}
              todayLabel={t('general.today')}
              clearLabel={t('general.clear')}
              onChange={handleEndDateChange}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default TimeRangePicker;
