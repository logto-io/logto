/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 * 2. Input field validation, should move the validation rule to the input field scope
 * 4. Read terms of use settings from SignInExperience Settings
 */
import classNames from 'classnames';
import React, { useState, useCallback, useMemo, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import { ErrorType } from '@/components/ErrorMessage';
import PhoneInput from '@/components/Input/PhoneInput';
import TermsOfUse from '@/components/TermsOfUse';
import PageContext from '@/hooks/page-context';
import useApi from '@/hooks/use-api';
import usePhoneNumber, { countryList } from '@/hooks/use-phone-number';
import { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  type: UserFlow;
};

type FieldState = {
  phone: string;
  termsAgreement: boolean;
};

type ErrorState = {
  [key in keyof FieldState]?: ErrorType;
};

type FieldValidations = {
  [key in keyof FieldState]: (state: FieldState) => ErrorType | undefined;
};

const defaultState: FieldState = { phone: '', termsAgreement: false };

const PhonePasswordless = ({ type }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const [fieldState, setFieldState] = useState<FieldState>(defaultState);
  const [fieldErrors, setFieldErrors] = useState<ErrorState>({});
  const { setToast } = useContext(PageContext);
  const navigate = useNavigate();

  const { phoneNumber, setPhoneNumber, isValidPhoneNumber } = usePhoneNumber();

  const sendPasscode = getSendPasscodeApi(type, 'phone');
  const { loading, error, result, run: asyncSendPasscode } = useApi(sendPasscode);

  const validations = useMemo<FieldValidations>(
    () => ({
      phone: ({ phone }) => {
        if (!isValidPhoneNumber(phone)) {
          return 'invalid_phone';
        }
      },
      termsAgreement: ({ termsAgreement }) => {
        if (!termsAgreement) {
          return 'agree_terms_required';
        }
      },
    }),
    [isValidPhoneNumber]
  );

  const onSubmitHandler = useCallback(() => {
    // Should be removed after api redesign
    if (loading) {
      return;
    }

    const phoneError = validations.phone(fieldState);

    if (phoneError) {
      setFieldErrors((previous) => ({ ...previous, phone: phoneError }));

      return;
    }

    const termsAgreementError = validations.termsAgreement(fieldState);

    if (termsAgreementError) {
      setFieldErrors((previous) => ({ ...previous, termsAgreement: termsAgreementError }));

      return;
    }

    void asyncSendPasscode(fieldState.phone);
  }, [loading, validations, fieldState, asyncSendPasscode]);

  useEffect(() => {
    setFieldState((previous) => ({
      ...previous,
      phone: `${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`,
    }));
  }, [phoneNumber]);

  useEffect(() => {
    console.log(result);

    if (result) {
      navigate(`/${type}/phone/passcode-validation`, { state: { phone: fieldState.phone } });
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
    <form className={styles.form}>
      <PhoneInput
        name="phone"
        className={classNames(styles.inputField, fieldErrors.phone && styles.withError)}
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
      <TermsOfUse
        name="termsAgreement"
        className={classNames(styles.terms, fieldErrors.termsAgreement && styles.withError)}
        termsOfUse={{ enabled: true, contentUrl: '/' }}
        isChecked={fieldState.termsAgreement}
        error={fieldErrors.termsAgreement}
        onChange={(checked) => {
          setFieldState((state) => ({ ...state, termsAgreement: checked }));
        }}
      />

      <Button onClick={onSubmitHandler}>{t('action.continue')}</Button>
    </form>
  );
};

export default PhonePasswordless;
