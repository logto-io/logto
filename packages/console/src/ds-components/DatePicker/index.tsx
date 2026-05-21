import classNames from 'classnames';
import { startOfDay } from 'date-fns';
import { useRef, useState } from 'react';
import { DayPicker, type Matcher } from 'react-day-picker';

import CalendarIcon from '@/assets/icons/calendar-outline.svg?react';
import { onKeyDownHandler } from '@/utils/a11y';

import Dropdown from '../Dropdown';

import styles from './index.module.scss';

type Props = {
  readonly value?: Date;
  readonly onChange: (next: Date | undefined) => void;
  /** Inclusive lower bound for selectable days. */
  readonly min?: Date;
  /** Inclusive upper bound for selectable days. */
  readonly max?: Date;
  readonly placeholder?: string;
  readonly ariaLabel?: string;
  readonly className?: string;
  /** Shown verbatim on a footer button that jumps the selection to today. */
  readonly todayLabel?: string;
  /** Shown verbatim on a footer button that clears the current selection. */
  readonly clearLabel?: string;
};

/**
 * Replaces the native `<input type="date">` so the displayed date format
 * follows `navigator.language` (matching `toLocaleDateString()` elsewhere)
 * instead of the OS regional setting Chrome locks the native input to.
 */
function DatePicker({
  value,
  onChange,
  min,
  max,
  placeholder = '__ / __ / __',
  ariaLabel,
  className,
  todayLabel,
  clearLabel,
}: Props) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const displayValue = value ? value.toLocaleDateString() : '';

  const open = () => {
    setIsOpen(true);
  };

  const handleSelect = (date: Date | undefined) => {
    setIsOpen(false);
    // Ignore `onSelect(undefined)` from react-day-picker's click-on-selected
    // toggle — clearing is reached through the footer button instead.
    if (date) {
      onChange(date);
    }
  };

  const handleToday = () => {
    setIsOpen(false);
    // Normalize to start-of-day so the emitted `Date` lines up with the
    // calendar's day-level matchers — a `new Date()` carries wall-clock time
    // which can fall just outside a day-precision `max` bound.
    onChange(startOfDay(new Date()));
  };

  const disabledMatchers: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
  ];

  const handleClear = () => {
    setIsOpen(false);
    onChange(undefined);
  };

  const showToday = todayLabel !== undefined;
  const showClear = clearLabel !== undefined;
  const footer =
    showToday || showClear ? (
      <div className={styles.footer}>
        {showClear && (
          <button type="button" className={styles.footerButton} onClick={handleClear}>
            {clearLabel}
          </button>
        )}
        {showToday && (
          <button type="button" className={styles.footerButton} onClick={handleToday}>
            {todayLabel}
          </button>
        )}
      </div>
    ) : undefined;

  return (
    <div
      ref={anchorRef}
      tabIndex={0}
      role="button"
      aria-label={ariaLabel}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      className={classNames(styles.trigger, isOpen && styles.highlight, className)}
      onClick={open}
      onKeyDown={onKeyDownHandler(open)}
    >
      <span className={classNames(styles.value, !displayValue && styles.placeholder)}>
        {displayValue || placeholder}
      </span>
      <CalendarIcon aria-hidden className={styles.icon} />
      <Dropdown
        hasOverflowContent
        anchorRef={anchorRef}
        isOpen={isOpen}
        horizontalAlign="start"
        onClose={() => {
          setIsOpen(false);
        }}
      >
        {/*
         * Event boundary. `onClick` keeps month-nav clicks from tripping
         * Dropdown's auto-close. `onKeyDown` lets `DayPicker` handle Enter /
         * Space for day selection without bubbling into Dropdown's
         * close-on-Enter handler — Esc still bubbles so the standard close
         * shortcut works.
         */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className={styles.calendar}
          onClick={(event) => {
            event.stopPropagation();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.stopPropagation();
            }
          }}
        >
          <DayPicker
            mode="single"
            selected={value}
            // Open at the latest selectable month: prefer the current value,
            // then the upper bound, then the lower bound. With none of these
            // set, react-day-picker defaults to today.
            defaultMonth={value ?? max ?? min}
            disabled={disabledMatchers.length > 0 ? disabledMatchers : undefined}
            footer={footer}
            onSelect={handleSelect}
          />
        </div>
      </Dropdown>
    </div>
  );
}

export default DatePicker;
