/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 */
import classNames from 'classnames';
import React, { useCallback, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import PhoneInput from '@/components/Input/PhoneInput';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
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

const defaultState: FieldState = { phone: '' };

const PhonePasswordless = ({ type, className }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { phoneNumber, setPhoneNumber, isValidPhoneNumber } = usePhoneNumber();
  const { fieldValue, setFieldValue, validateForm, register } = useForm(defaultState);
  const { setToast } = useContext(PageContext);
  const navigate = useNavigate();
  const { termsValidation } = useTerms();

  const sendPasscode = getSendPasscodeApi(type, 'sms');
  const { error, result, run: asyncSendPasscode } = useApi(sendPasscode);

  const phoneNumberValidation = useCallback(
    (phoneNumber: string) => {
      if (!isValidPhoneNumber(phoneNumber)) {
        return 'invalid_phone';
      }
    },
    [isValidPhoneNumber]
  );

  const onSubmitHandler = useCallback(() => {
    if (!validateForm()) {
      return;
    }

    if (!termsValidation()) {
      return;
    }

    void asyncSendPasscode(fieldValue.phone);
  }, [validateForm, termsValidation, asyncSendPasscode, fieldValue.phone]);

  useEffect(() => {
    // Sync phoneNumber
    setFieldValue((previous) => ({
      ...previous,
      phone: `${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`,
    }));
  }, [phoneNumber, setFieldValue]);

  useEffect(() => {
    if (result) {
      navigate(`/${type}/sms/passcode-validation`, { state: { phone: fieldValue.phone } });
    }
  }, [fieldValue.phone, navigate, result, type]);

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
        {...register('phone', phoneNumberValidation)}
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
