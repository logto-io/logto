import { useContext, useEffect, useMemo, useRef, useState } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import SecondaryPageLayout from '@ac/layouts/SecondaryPageLayout';
import { VerificationMethod } from '@ac/types';

import EmailVerification from '../EmailVerification';
import PasswordVerification from '../PasswordVerification';
import PhoneVerification from '../PhoneVerification';
import VerificationMethodButton from '../VerificationMethodButton';

const isVerificationMethod = (value: VerificationMethod | false): value is VerificationMethod =>
  value !== false;

const VerificationMethodList = () => {
  const { userInfo } = useContext(PageContext);
  const [verifyingMethod, setVerifyingMethod] = useState<VerificationMethod>();
  // Track if we already auto-selected the only available method to avoid re-trigger on Back.
  const hasAutoSelectedMethod = useRef(false);

  const hasPasswordVerification = Boolean(userInfo?.hasPassword);
  const hasEmailVerification = Boolean(userInfo?.primaryEmail);
  const hasPhoneVerification = Boolean(userInfo?.primaryPhone);

  const availableMethods = useMemo(
    () =>
      [
        hasPasswordVerification && VerificationMethod.Password,
        hasEmailVerification && VerificationMethod.EmailCode,
        hasPhoneVerification && VerificationMethod.PhoneCode,
      ].filter((method) => isVerificationMethod(method)),
    [hasEmailVerification, hasPasswordVerification, hasPhoneVerification]
  );

  useEffect(() => {
    // Auto-select the lone available method once on mount.
    if (!verifyingMethod && availableMethods.length === 1 && !hasAutoSelectedMethod.current) {
      setVerifyingMethod(availableMethods[0]);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasAutoSelectedMethod.current = true;
      return;
    }

    // Clear selection if it no longer exists (e.g., user info changed).
    if (verifyingMethod && !availableMethods.includes(verifyingMethod)) {
      setVerifyingMethod(undefined);
      // eslint-disable-next-line @silverhand/fp/no-mutation
      hasAutoSelectedMethod.current = false;
    }
  }, [availableMethods, verifyingMethod]);

  const hasAlternativeMethod = availableMethods.length > 1;

  if (verifyingMethod === VerificationMethod.Password) {
    return (
      <PasswordVerification
        hasAlternativeMethod={hasAlternativeMethod}
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
        onSwitchMethod={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  if (verifyingMethod === VerificationMethod.EmailCode) {
    return (
      <EmailVerification
        hasAlternativeMethod={hasAlternativeMethod}
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
        onSwitchMethod={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  if (verifyingMethod === VerificationMethod.PhoneCode) {
    return (
      <PhoneVerification
        hasAlternativeMethod={hasAlternativeMethod}
        onBack={() => {
          setVerifyingMethod(undefined);
        }}
        onSwitchMethod={() => {
          setVerifyingMethod(undefined);
        }}
      />
    );
  }

  return (
    <SecondaryPageLayout
      title="account_center.verification.title"
      description="account_center.verification.description"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {hasPasswordVerification && (
          <VerificationMethodButton
            method={VerificationMethod.Password}
            onClick={() => {
              setVerifyingMethod(VerificationMethod.Password);
            }}
          />
        )}
        {hasEmailVerification && (
          <VerificationMethodButton
            method={VerificationMethod.EmailCode}
            onClick={() => {
              setVerifyingMethod(VerificationMethod.EmailCode);
            }}
          />
        )}
        {hasPhoneVerification && (
          <VerificationMethodButton
            method={VerificationMethod.PhoneCode}
            onClick={() => {
              setVerifyingMethod(VerificationMethod.PhoneCode);
            }}
          />
        )}
      </div>
    </SecondaryPageLayout>
  );
};

export default VerificationMethodList;
