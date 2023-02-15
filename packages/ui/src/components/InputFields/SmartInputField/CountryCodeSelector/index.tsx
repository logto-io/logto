import classNames from 'classnames';
import type { ChangeEventHandler, ForwardedRef } from 'react';
import { useMemo, forwardRef } from 'react';

import DownArrowIcon from '@/assets/icons/arrow-down.svg';
import { getCountryList, getDefaultCountryCallingCode } from '@/utils/country-code';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  value?: string;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
};

const CountryCodeSelector = (
  { className, value, onChange }: Props,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const countryList = useMemo(getCountryList, []);
  const defaultCountCode = useMemo(getDefaultCountryCallingCode, []);

  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const countryCode = value || defaultCountCode;

  return (
    <div ref={ref} className={classNames(styles.countryCodeSelector, className)}>
      <span>{`+${countryCode}`}</span>
      <DownArrowIcon />

      <select name="countryCode" autoComplete="country-code" onChange={onChange}>
        {countryList.map(({ countryCallingCode, countryCode }) => (
          <option key={countryCode} value={countryCallingCode}>
            {`+${countryCallingCode}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default forwardRef(CountryCodeSelector);
