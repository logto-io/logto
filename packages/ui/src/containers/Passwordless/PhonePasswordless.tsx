import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { getSendPasscodeApi } from '@/apis/utils';
import Button from '@/components/Button';
import { PhoneInput } from '@/components/Input';
import PasswordlessSwitch from '@/containers/PasswordlessSwitch';
import TermsOfUse from '@/containers/TermsOfUse';
import type { ErrorHandlers } from '@/hooks/use-api';
import useApi from '@/hooks/use-api';
import useForm from '@/hooks/use-form';
import usePhoneNumber from '@/hooks/use-phone-number';
import useTerms from '@/hooks/use-terms';
import type { UserFlow } from '@/types';

import * as styles from './index.module.scss';

type Props = {
  type: UserFlow;
  className?: string;
  // eslint-disable-next-line react/boolean-prop-naming
  autoFocus?: boolean;
  hasTerms?: boolean;
  hasSwitch?: boolean;
};

type FieldState = {
  phone: string;
};

const defaultState: FieldState = { phone: '' };

const PhonePasswordless = ({
  type,
  autoFocus,
  hasTerms = true,
  hasSwitch = false,
  className,
}: Props) => {
  const { t } = useTranslation();

  const { termsValidation } = useTerms();
  const { countryList, phoneNumber, setPhoneNumber, isValidPhoneNumber } = usePhoneNumber();
  const navigate = useNavigate();
  const { fieldValue, setFieldValue, setFieldErrors, validateForm, register } =
    useForm(defaultState);

  const errorHandlers: ErrorHandlers = useMemo(
    () => ({
      'guard.invalid_input': () => {
        setFieldErrors({ phone: 'invalid_phone' });
      },
    }),
    [setFieldErrors]
  );

  const sendPasscode = getSendPasscodeApi(type, SignInIdentifier.Sms);
  const { result, run: asyncSendPasscode } = useApi(sendPasscode, errorHandlers);

  const phoneNumberValidation = useCallback(
    (phoneNumber: string) => {
      if (!isValidPhoneNumber(phoneNumber)) {
        return 'invalid_phone';
      }
    },
    [isValidPhoneNumber]
  );

  const onSubmitHandler = useCallback(
    async (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();

      if (!validateForm()) {
        return;
      }

      if (hasTerms && !(await termsValidation())) {
        return;
      }

      void asyncSendPasscode(fieldValue.phone);
    },
    [validateForm, hasTerms, termsValidation, asyncSendPasscode, fieldValue.phone]
  );

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
        { state: { sms: fieldValue.phone } }
      );
    }
  }, [fieldValue.phone, navigate, result, type]);

  return (
    <form className={classNames(styles.form, className)} onSubmit={onSubmitHandler}>
      <div className={styles.formFields}>
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
        {hasSwitch && <PasswordlessSwitch target="email" className={styles.switch} />}
      </div>

      {hasTerms && <TermsOfUse className={styles.terms} />}

      <Button title="action.continue" onClick={async () => onSubmitHandler()} />

      <input hidden type="submit" />
    </form>
  );
};

export default PhonePasswordless;
