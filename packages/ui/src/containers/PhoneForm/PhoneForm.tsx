import classNames from 'classnames';
import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { PhoneInput } from '@/components/Input';
import PasswordlessSwitch from '@/containers/PasswordlessSwitch';
import TermsOfUse from '@/containers/TermsOfUse';
import useForm from '@/hooks/use-form';
import usePhoneNumber from '@/hooks/use-phone-number';
import useTerms from '@/hooks/use-terms';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasTerms?: boolean;
  hasSwitch?: boolean;
  errorMessage?: string;
  clearErrorMessage?: () => void;
  onSubmit: (phone: string) => Promise<void>;
};

type FieldState = {
  phone: string;
};

const defaultState: FieldState = { phone: '' };

const PhoneForm = ({
  autoFocus,
  hasTerms = true,
  hasSwitch = false,
  className,
  errorMessage,
  clearErrorMessage,
  onSubmit,
}: Props) => {
  const { t } = useTranslation();

  const { termsValidation } = useTerms();
  const { countryList, phoneNumber, setPhoneNumber, isValidPhoneNumber } = usePhoneNumber();

  const { fieldValue, setFieldValue, validateForm, register } = useForm(defaultState);

  /*  Clear the form error when input field is updated */
  const errorMessageRef = useRef(errorMessage);

  useEffect(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    errorMessageRef.current = errorMessage;
  }, [errorMessage]);

  useEffect(() => {
    if (errorMessageRef.current) {
      clearErrorMessage?.();
    }
  }, [clearErrorMessage, errorMessageRef, fieldValue.phone]);

  // Validate phoneNumber with given country code
  const phoneNumberValidation = useCallback(
    (phoneNumber: string) => {
      if (!isValidPhoneNumber(phoneNumber)) {
        return 'invalid_phone';
      }
    },
    [isValidPhoneNumber]
  );

  // Sync phoneNumber
  useEffect(() => {
    setFieldValue((previous) => ({
      ...previous,
      phone: `${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`,
    }));
  }, [phoneNumber, setFieldValue]);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (hasTerms && !(await termsValidation())) {
        return;
      }

      await onSubmit(fieldValue.phone);
    },
    [validateForm, hasTerms, termsValidation, onSubmit, fieldValue.phone]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <PhoneInput
        name="phone"
        placeholder={t('input.phone_number')}
        className={styles.inputField}
        countryCallingCode={phoneNumber.countryCallingCode}
        nationalNumber={phoneNumber.nationalNumber}
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus={autoFocus}
        countryList={countryList}
        {...register('phone', phoneNumberValidation)}
        onChange={(data) => {
          setPhoneNumber((previous) => ({ ...previous, ...data }));
        }}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      {hasSwitch && <PasswordlessSwitch target="email" className={styles.switch} />}

      {hasTerms && <TermsOfUse className={styles.terms} />}

      <Button title="action.continue" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default PhoneForm;
