import { SignInIdentifier } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useParams, useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
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

  if (!is(state, socialAccountNotExistErrorDataGuard)) {
    return <ErrorPage rawMessage="Missing relate account info" />;
  }

  if (!connectorId) {
    return <ErrorPage rawMessage="Connector not found" />;
  }

  const { relatedUser } = state;

  return (
    <SecondaryPageLayout title={getPageTitle(signUpMethods)}>
      <SocialLinkAccountContainer connectorId={connectorId} relatedUser={relatedUser} />
    </SecondaryPageLayout>
  );
};

export default SocialLinkAccount;
