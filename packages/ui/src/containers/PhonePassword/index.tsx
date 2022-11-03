import classNames from 'classnames';
import { useMemo, useCallback, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { signInWithPhonePassword } from '@/apis/sign-in';
import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import { PhoneInput, PasswordInput } from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import usePhoneNumber from '@/hooks/use-phone-number';
import useTerms from '@/hooks/use-terms';
import { SearchParameters } from '@/types';
import { getSearchParameters } from '@/utils';
import { requiredValidation } from '@/utils/field-validations';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
};

type FieldState = {
  phone: string;
  password: string;
};

const defaultState: FieldState = {
  phone: '',
  password: '',
};

const PhonePassword = ({ className, autoFocus }: Props) => {
  const { t } = useTranslation();
  const { termsValidation } = useTerms();

  const [errorMessage, setErrorMessage] = useState<string>();
  const { countryList, phoneNumber, setPhoneNumber, isValidPhoneNumber } = usePhoneNumber();
  const { fieldValue, setFieldValue, register, validateForm } = useForm(defaultState);

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

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'session.invalid_credentials': (error) => {
        setErrorMessage(error.message);
      },
    }),
    [setErrorMessage]
  );

  const { run: asyncSignInWithPhonePassword } = useApi(signInWithPhonePassword, errorHandlers);

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      setErrorMessage(undefined);

      if (!validateForm()) {
        return;
      }

      if (!(await termsValidation())) {
        return;
      }

      const socialToBind = getSearchParameters(location.search, SearchParameters.bindWithSocial);

      void asyncSignInWithPhonePassword(fieldValue.phone, fieldValue.password, socialToBind);
    },
    [
      validateForm,
      termsValidation,
      asyncSignInWithPhonePassword,
      fieldValue.phone,
      fieldValue.password,
    ]
  );

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <PhoneInput
        name="phone"
        placeholder={t('input.phone_number')}
        className={styles.inputField}
        countryCallingCode={phoneNumber.countryCallingCode}
        nationalNumber={phoneNumber.nationalNumber}
        autoFocus={autoFocus}
        countryList={countryList}
        {...register('phone', phoneNumberValidation)}
        onChange={(data) => {
          setPhoneNumber((previous) => ({ ...previous, ...data }));
        }}
      />
      <PasswordInput
        className={styles.inputField}
        name="password"
        autoComplete="current-password"
        placeholder={t('input.password')}
        {...register('password', (value) => requiredValidation('password', value))}
      />

      {errorMessage && <ErrorMessage className={styles.formErrors}>{errorMessage}</ErrorMessage>}

      <TermsOfUse className={styles.terms} />

      <Button title="action.sign_in" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default PhonePassword;
