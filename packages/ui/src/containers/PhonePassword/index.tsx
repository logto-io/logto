import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/Button';
import ErrorMessage from '@/components/ErrorMessage';
import ForgotPasswordLink from '@/components/ForgotPasswordLink';
import { PhoneInput, PasswordInput } from '@/components/Input';
import TermsOfUse from '@/containers/TermsOfUse';
import useForm from '@/hooks/use-form';
import usePasswordSignIn from '@/hooks/use-password-sign-in';
import usePhoneNumber from '@/hooks/use-phone-number';
import { useForgotPasswordSettings } from '@/hooks/use-sie';
import useTerms from '@/hooks/use-terms';
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
  const { errorMessage, clearErrorMessage, onSubmit } = usePasswordSignIn(SignInIdentifier.Sms);
  const { isForgotPasswordEnabled, sms } = useForgotPasswordSettings();

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

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      clearErrorMessage();

      if (!validateForm()) {
        return;
      }

      if (!(await termsValidation())) {
        return;
      }

      void onSubmit(fieldValue.phone, fieldValue.password);
    },
    [
      clearErrorMessage,
      validateForm,
      termsValidation,
      onSubmit,
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

      {isForgotPasswordEnabled && (
        <ForgotPasswordLink
          className={styles.link}
          method={sms ? SignInIdentifier.Sms : SignInIdentifier.Email}
        />
      )}

      <TermsOfUse className={styles.terms} />

      <Button title="action.sign_in" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default PhonePassword;
