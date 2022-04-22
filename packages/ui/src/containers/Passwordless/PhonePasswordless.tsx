/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 * 2. Input field validation, should move the validation rule to the input field scope
 */
import classNames from 'classnames';
import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import { ErrorType } from '@/components/ErrorMessage';
import PhoneInput from '@/components/Input/PhoneInput';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi from '@/hooks/use-api';
import { PageContext } from '@/hooks/use-page-context';
import usePhoneNumber, { countryList } from '@/hooks/use-phone-number';
import useTerms from '@/hooks/use-terms';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  type: UserFlow;
  className?: string;
};

type FieldState = {
  phone: string;
};

type ErrorState = {
  [key in keyof FieldState]?: ErrorType;
};

type FieldValidations = {
  [key in keyof FieldState]: (state: FieldState) => ErrorType | undefined;
};

const defaultState: FieldState = { phone: '' };

const PhonePasswordless = ({ type, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const [fieldState, setFieldState] = useState<FieldState>(defaultState);
  const [fieldErrors, setFieldErrors] = useState<ErrorState>({});
  const { setToast } = useContext(PageContext);
  const navigate = useNavigate();
  const { termsValidation } = useTerms();

  const { phoneNumber, setPhoneNumber, isValidPhoneNumber } = usePhoneNumber();

  const sendPasscode = getSendPasscodeApi(type, 'sms');
  const { error, result, run: asyncSendPasscode } = useApi(sendPasscode);

  const validations = useMemo<FieldValidations>(
    () => ({
      phone: ({ phone }) => {
        if (!isValidPhoneNumber(phone)) {
          return 'invalid_phone';
        }
      },
    }),
    [isValidPhoneNumber]
  );

  const onSubmitHandler = useCallback(() => {
    const phoneError = validations.phone(fieldState);

    if (phoneError) {
      setFieldErrors((previous) => ({ ...previous, phone: phoneError }));

      return;
    }

    if (!termsValidation()) {
      return;
    }

    void asyncSendPasscode(fieldState.phone);
  }, [validations, fieldState, termsValidation, asyncSendPasscode]);

  useEffect(() => {
    setFieldState((previous) => ({
      ...previous,
      phone: `${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`,
    }));
  }, [phoneNumber]);

  useEffect(() => {
    if (result) {
      navigate(`/${type}/sms/passcode-validation`, { state: { phone: fieldState.phone } });
    }
  }, [fieldState.phone, navigate, result, type]);

  useEffect(() => {
    // Clear errors
    for (const key of Object.keys(fieldState) as [keyof FieldState]) {
      if (fieldState[key]) {
        setFieldErrors((previous) => {
          if (!previous[key]) {
            return previous;
          }

          return { ...previous, [key]: validations[key](fieldState) };
        });
      }
    }
  }, [fieldState, validations]);

  useEffect(() => {
    if (error) {
      setToast(t('error.request', { ...error }));
    }
  }, [error, t, setToast]);

  return (
    <form className={classNames(styles.form, className)}>
      <PhoneInput
        name="phone"
        className={styles.inputField}
        autoComplete="mobile"
        placeholder={t('input.phone_number')}
        countryCallingCode={phoneNumber.countryCallingCode}
        nationalNumber={phoneNumber.nationalNumber}
        countryList={countryList}
        error={fieldErrors.phone}
        onChange={(data) => {
          setPhoneNumber((previous) => ({ ...previous, ...data }));
        }}
      />
      <TermsOfUse className={styles.terms} />

      <Button onClick={onSubmitHandler}>{t('action.continue')}</Button>
    </form>
  );
};

export default PhonePasswordless;
