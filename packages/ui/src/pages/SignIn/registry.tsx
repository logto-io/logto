import React from 'react';

import Divider from '@/components/Divider';
import TextLink from '@/components/TextLink';
import { EmailPasswordless, PhonePasswordless } from '@/containers/Passwordless';
import SignInMethodsLink from '@/containers/SignInMethodsLink';
import { PrimarySocialSignIn, SecondarySocialSignIn } from '@/containers/SocialSignIn';
import TermsOfUse from '@/containers/TermsOfUse';
import UsernameSignin from '@/containers/UsernameSignin';
import { SignInMethod, LocalSignInMethod } from '@/types';

import * as styles from './index.module.scss';

export const PrimarySection = ({ signInMethod }: { signInMethod?: SignInMethod }) => {
  switch (signInMethod) {
    case 'email':
      return <EmailPasswordless type="sign-in" className={styles.primarySignIn} />;
    case 'sms':
      return <PhonePasswordless type="sign-in" className={styles.primarySignIn} />;
    case 'username':
      return <UsernameSignin className={styles.primarySignIn} />;
    case 'social':
      return (
        <>
          <TermsOfUse className={styles.terms} />
          <PrimarySocialSignIn className={styles.primarySocial} />
        </>
      );
    default:
      return null;
  }
};

export const SecondarySection = ({
  primarySignInMethod,
  secondarySignInMethods,
}: {
  primarySignInMethod?: SignInMethod;
  secondarySignInMethods?: SignInMethod[];
}) => {
  if (!primarySignInMethod || !secondarySignInMethods?.length) {
    return null;
  }

  const localMethods = secondarySignInMethods.filter(
    (method): method is LocalSignInMethod => method !== 'social'
  );

  if (primarySignInMethod === 'social' && localMethods.length > 0) {
    return (
      <>
        <Divider label="description.continue_with" className={styles.divider} />
        <SignInMethodsLink signInMethods={localMethods} />
      </>
    );
  }

  return (
    <>
      <SignInMethodsLink
        signInMethods={localMethods}
        template="sign_in_with"
        className={styles.otherMethodsLink}
      />
      {secondarySignInMethods.includes('social') && (
        <>
          <Divider label="description.or" className={styles.divider} />
          <SecondarySocialSignIn />
        </>
      )}
    </>
  );
};

export const CreateAccountLink = ({
  primarySignInMethod,
}: {
  primarySignInMethod?: SignInMethod;
}) => {
  switch (primarySignInMethod) {
    case 'username':
    case 'email':
    case 'sms':
      return (
        <>
          <div className={styles.placeHolder} />
          <TextLink
            className={styles.createAccount}
            type="secondary"
            href={`/register/${primarySignInMethod}`}
            text="action.create_account"
          />
        </>
      );
    default:
      return null;
  }
};
