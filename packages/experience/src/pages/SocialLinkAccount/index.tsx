import { SignInIdentifier, VerificationType } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import SocialLinkAccountContainer from '@/containers/SocialLinkAccount';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { socialAccountNotExistErrorDataGuard } from '@/types/guard';

type Parameters = {
  connectorId: string;
};

const getPageTitle = (signUpMethods: SignInIdentifier[]): TFuncKey => {
  if (
    signUpMethods.includes(SignInIdentifier.Email) &&
    signUpMethods.includes(SignInIdentifier.Phone)
  ) {
    return 'description.link_email_or_phone';
  }

  if (signUpMethods.includes(SignInIdentifier.Email)) {
    return 'description.link_email';
  }

  if (signUpMethods.includes(SignInIdentifier.Phone)) {
    return 'description.link_phone';
  }

  return 'description.bind_account_title';
};

const SocialLinkAccount = () => {
  const { connectorId } = useParams<Parameters>();
  const { state } = useLocation();
  const { signUpMethods } = useSieMethods();
  const { verificationIdsMap } = useContext(UserInteractionContext);
  const verificationId = verificationIdsMap[VerificationType.Social];

  if (!is(state, socialAccountNotExistErrorDataGuard)) {
    return <ErrorPage rawMessage="Missing relate account info" />;
  }

  if (!connectorId) {
    return <ErrorPage rawMessage="Connector not found" />;
  }

  if (!verificationId) {
    return <ErrorPage title="error.invalid_session" rawMessage="Verification ID not found" />;
  }

  const { relatedUser } = state;

  return (
    <SecondaryPageLayout title={getPageTitle(signUpMethods)}>
      <SocialLinkAccountContainer
        connectorId={connectorId}
        verificationId={verificationId}
        relatedUser={relatedUser}
      />
    </SecondaryPageLayout>
  );
};

export default SocialLinkAccount;
