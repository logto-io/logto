/**
 * TODO:
 * 1. API redesign handle api error and loading status globally in PageContext
 */
import classNames from 'classnames';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import PhoneInput from '@/components/Input/PhoneInput';
import CreateAccountConfirmModal from '@/containers/CreateAccountConfirmModal';
import TermsOfUse from '@/containers/TermsOfUse';
import useApi, { ErrorHandlers } from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
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
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false);
  const { t } = useTranslation(undefined, { keyPrefix: 'main_flow' });
  const { phoneNumber, setPhoneNumber, isValidPhoneNumber } = usePhoneNumber();
  const navigate = useNavigate();
  const { termsValidation } = useTerms();
  const { fieldValue, setFieldValue, validateForm, register } = useForm(defaultState);
  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'user.phone_not_exists': () => {
        setShowCreateAccountModal(true);
      },
    }),
    []
  );

  const sendPasscode = getSendPasscodeApi(type, 'sms');
  const { result, run: asyncSendPasscode } = useApi(sendPasscode, errorHandlers);

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

  const onModalCloseHandler = useCallback(() => {
    setShowCreateAccountModal(false);
  }, []);

  useEffect(() => {
    // Sync phoneNumber
    setFieldValue((previous) => ({
      ...previous,
      phone: `${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`,
    }));
  }, [phoneNumber, setFieldValue]);

  useEffect(() => {
    if (result) {
      navigate(
        { pathname: `/${type}/sms/passcode-validation`, search: location.search },
        { state: { phone: fieldValue.phone } }
      );
    }
  }, [fieldValue.phone, navigate, result, type]);

  return (
    <>
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
      <CreateAccountConfirmModal
        isOpen={showCreateAccountModal}
        type="sms"
        value={fieldValue.phone}
        onClose={onModalCloseHandler}
      />
    </>
  );
};

export default PhonePasswordless;
