import { SignInIdentifier } from '@logto/schemas';
import type { TFuncKey } from 'react-i18next';
import { useParams, useLocation } from 'react-router-dom';
import { is } from 'superstruct';

import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import SocialLinkAccountContainer from '@/containers/SocialLinkAccount';
import { useSieMethods } from '@/hooks/use-sie';
import ErrorPage from '@/pages/ErrorPage';
import { socialAccountNotExistErrorDataGuard } from '@/types/guard';

type Parameters = {
  connector: string;
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
  const { connector } = useParams<Parameters>();
  const { state } = useLocation();
  const { signUpMethods } = useSieMethods();

  if (!is(state, socialAccountNotExistErrorDataGuard)) {
    return <ErrorPage rawMessage="Missing relate account info" />;
  }

  if (!connector) {
    return <ErrorPage rawMessage="Connector not found" />;
  }

  const { relatedUser } = state;

  return (
    <SecondaryPageWrapper title={getPageTitle(signUpMethods)}>
      <SocialLinkAccountContainer connectorId={connector} relatedUser={relatedUser} />
    </SecondaryPageWrapper>
  );
};

export default SocialLinkAccount;
