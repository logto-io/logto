import React from 'react';

import PhoneInput from '@/components/Input/PhoneInput';
import usePhoneNumber, { countryList } from '@/hooks/use-phone-number';

export type Props = {
  name: string;
  autoComplete?: AutoCompleteType;
  isDisabled?: boolean;
  className?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
};

const PhoneInputProvider = ({ value, onChange, ...inputProps }: Props) => {
  // TODO: error message
  const {
    error,
    phoneNumber: { countryCallingCode, nationalNumber },
    setPhoneNumber,
  } = usePhoneNumber(value, onChange);

  return (
    <PhoneInput
      {...inputProps}
      countryCallingCode={countryCallingCode}
      nationalNumber={nationalNumber}
      countryList={countryList}
      hasError={Boolean(error)}
      onChange={(data) => {
        setPhoneNumber((phoneNumber) => ({ ...phoneNumber, ...data, initialized: true }));
      }}
    />
  );
};

export default PhoneInputProvider;
