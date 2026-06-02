import { ReservedResource } from '@logto/core-kit';
import { type ConsentInfoResponse } from '@logto/schemas';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import { consent, getConsentInfo } from '@/apis/consent';
import TermsLinks from '@/components/TermsLinks';
import TextLink from '@/components/TextLink';
import useApi from '@/hooks/use-api';
import useErrorHandler, { type ErrorHandlers } from '@/hooks/use-error-handler';
import useGlobalRedirectTo from '@/hooks/use-global-redirect-to';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';

import OrganizationSelector, { type Organization } from './OrganizationSelector';
import ScopesListCard from './ScopesListCard';
import UserProfile from './UserProfile';
import styles from './index.module.scss';
import { getRedirectUriOrigin } from './util';

const Consent = () => {
  const handleError = useErrorHandler();
  const asyncConsent = useApi(consent);
  const { t } = useTranslation();
  const redirectTo = useGlobalRedirectTo();

  const [consentData, setConsentData] = useState<ConsentInfoResponse>();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>();
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  const [isConsentLoading, setIsConsentLoading] = useState(false);

  const asyncGetConsentInfo = useApi(getConsentInfo);

  const consentErrorHandlers: ErrorHandlers = useMemo(
    () => ({
      'oidc.access_denied': () => {
        setIsAccessDenied(true);
      },
    }),
    []
  );

  const handleConsentError = useCallback(
    async (error: unknown) => {
      await handleError(error, consentErrorHandlers);
    },
    [consentErrorHandlers, handleError]
  );

  const consentHandler = useCallback(async () => {
    setIsConsentLoading(true);
    const [error, result] = await asyncConsent(selectedOrganization?.id);
    setIsConsentLoading(false);

    if (error) {
      await handleConsentError(error);

      return;
    }

    if (result?.redirectTo) {
      await redirectTo(result.redirectTo);
    }
  }, [asyncConsent, handleConsentError, redirectTo, selectedOrganization?.id]);

  useEffect(() => {
    const getConsentInfoHandler = async () => {
      const [error, result] = await asyncGetConsentInfo();

      if (error) {
        await handleConsentError(error);

        return;
      }

      setConsentData(result);

      // Init the default organization selection
      if (!result?.organizations?.length) {
        return;
      }

      setSelectedOrganization(result.organizations[0]);
    };

    void getConsentInfoHandler();
  }, [asyncGetConsentInfo, handleConsentError]);

  if (isAccessDenied) {
    return (
      <ErrorPage
        isNavbarHidden
        title="error.access_denied"
        message="error.application_access_denied"
      />
    );
  }

  if (!consentData) {
    return null;
  }

  const {
    application: { displayName, name, termsOfUseUrl, privacyPolicyUrl },
  } = consentData;

  const applicationName = displayName ?? name;
  const showTerms = Boolean(termsOfUseUrl ?? privacyPolicyUrl);
  const { redirectUri } = consentData;
  const redirectUriOrigin = consentData.redirectUri
    ? getRedirectUriOrigin(consentData.redirectUri)
    : undefined;

  return (
    <LandingPageLayout
      title="description.authorize_title"
      titleInterpolation={{
        name: applicationName,
      }}
      thirdPartyBranding={consentData.application.branding}
    >
      <UserProfile user={consentData.user} />
      <ScopesListCard
        userScopes={consentData.missingOIDCScope}
        /**
         * The org resources is included in the user scopes for compatibility.
         */
        resourceScopes={consentData.missingResourceScopes?.filter(
          ({ resource }) => resource.id !== ReservedResource.Organization
        )}
        appName={applicationName}
        className={styles.scopesCard}
      />
      {consentData.organizations && (
        <OrganizationSelector
          className={styles.organizationSelector}
          organizations={consentData.organizations}
          selectedOrganization={selectedOrganization}
          onSelect={setSelectedOrganization}
        />
      )}
      <div className={styles.footerButton}>
        {redirectUri && (
          <Button
            title="action.cancel"
            type="secondary"
            onClick={() => {
              window.location.replace(redirectUri);
            }}
          />
        )}
        <Button title="action.authorize" isLoading={isConsentLoading} onClick={consentHandler} />
      </div>
      {!showTerms && redirectUriOrigin && (
        <div className={styles.redirectUri}>
          {t('description.redirect_to', { name: redirectUriOrigin })}
        </div>
      )}
      {showTerms && redirectUriOrigin && (
        <div className={styles.terms}>
          <Trans
            components={{
              link: (
                <TermsLinks
                  inline
                  termsOfUseUrl={termsOfUseUrl ?? ''}
                  privacyPolicyUrl={privacyPolicyUrl ?? ''}
                />
              ),
            }}
          >
            {t('description.authorize_agreement_with_redirect', {
              name,
              uri: redirectUriOrigin,
            })}
          </Trans>
        </div>
      )}
      {showTerms && !redirectUriOrigin && (
        <div className={styles.terms}>
          <Trans
            components={{
              link: (
                <TermsLinks
                  inline
                  termsOfUseUrl={termsOfUseUrl ?? ''}
                  privacyPolicyUrl={privacyPolicyUrl ?? ''}
                />
              ),
            }}
          >
            {t('description.authorize_agreement', {
              name,
            })}
          </Trans>
        </div>
      )}
      <div className={styles.footerLink}>
        {t('description.not_you')}{' '}
        <TextLink replace to="/sign-in" text="action.use_another_account" />
      </div>
    </LandingPageLayout>
  );
};

export default Consent;
