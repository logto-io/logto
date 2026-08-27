import { ReservedResource } from '@logto/core-kit';
import { type ConsentInfoResponse, isCimdClientId } from '@logto/schemas';
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
import { searchKeys } from '@/shared/utils/search-parameters';

import OrganizationRoster from './OrganizationRoster';
import OrganizationSelector, { type Organization } from './OrganizationSelector';
import ScopesListCard from './ScopesListCard';
import UnregisteredClientNotice from './UnregisteredClientNotice';
import UserProfile from './UserProfile';
import styles from './index.module.scss';
import { getClientIdentifierHost, getRedirectUriOrigin } from './util';

/**
 * Resolve how the client identifies itself on the page.
 *
 * An unregistered (CIMD) client is recognized by its identifier alone: the consent info keeps the
 * client identifier URL in `id`, and a registered application id never takes that shape. Its name
 * comes from the metadata document, which may omit `client_name` — the identifier host stands in
 * then, and stays on the page as a permanent identity signal either way.
 */
const getClientDisplayData = ({ application: { id, displayName, name } }: ConsentInfoResponse) => {
  const unregisteredClientHost = isCimdClientId(id) ? getClientIdentifierHost(id) : undefined;

  return {
    unregisteredClientHost,
    applicationName: (displayName ?? name) || (unregisteredClientHost ?? name),
  };
};

const Consent = () => {
  const handleError = useErrorHandler();
  const asyncConsent = useApi(consent);
  const { t } = useTranslation();
  const redirectTo = useGlobalRedirectTo();

  const [consentData, setConsentData] = useState<ConsentInfoResponse>();
  const [selectedOrganizations, setSelectedOrganizations] = useState<Organization[]>([]);
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

  const signOut = useCallback(() => {
    const applicationId =
      new URLSearchParams(window.location.search).get(searchKeys.appId) ??
      consentData?.application.id;
    const signOutUrl = new URL('/oidc/session/end', window.location.origin);

    if (applicationId) {
      signOutUrl.searchParams.set('client_id', applicationId);
    }

    window.location.assign(signOutUrl.href);
  }, [consentData?.application.id]);

  const consentHandler = useCallback(async () => {
    setIsConsentLoading(true);
    const [error, result] = await asyncConsent(selectedOrganizations.map(({ id }) => id));
    setIsConsentLoading(false);

    if (error) {
      await handleConsentError(error);

      return;
    }

    if (result?.redirectTo) {
      await redirectTo(result.redirectTo);
    }
  }, [asyncConsent, handleConsentError, redirectTo, selectedOrganizations]);

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

      /**
       * A CIMD authorization consents exactly one organization, so the first stays preselected.
       * A registered application starts from its consented organizations, which are locked into
       * the selection; beyond that, a sole organization offers no real choice and stays
       * preselected, while a roster of several starts empty for the user to pick from.
       */
      if (isCimdClientId(result.application.id)) {
        setSelectedOrganizations(result.organizations.slice(0, 1));

        return;
      }

      const consentedOrganizations = result.organizations.filter(({ isConsented }) => isConsented);

      setSelectedOrganizations(
        consentedOrganizations.length > 0 || result.organizations.length > 1
          ? consentedOrganizations
          : result.organizations.slice(0, 1)
      );
    };

    void getConsentInfoHandler();
  }, [asyncGetConsentInfo, handleConsentError]);

  if (isAccessDenied) {
    return (
      <ErrorPage
        isNavbarHidden
        title="error.access_denied"
        message="error.application_access_denied"
        primaryAction={{
          title: 'account_center.sessions.revoke_session',
          onClick: signOut,
        }}
      />
    );
  }

  if (!consentData) {
    return null;
  }

  const {
    application: { termsOfUseUrl, privacyPolicyUrl },
  } = consentData;

  const { unregisteredClientHost, applicationName } = getClientDisplayData(consentData);

  const toggleOrganization = (organization: Organization) => {
    /**
     * Consented organizations are locked: a later consent round can only add organizations.
     * They stay in the submitted selection, which is safe since the consent insert is
     * idempotent.
     */
    if (organization.isConsented) {
      return;
    }

    setSelectedOrganizations((selectedOrganizations) =>
      selectedOrganizations.some(({ id }) => id === organization.id)
        ? selectedOrganizations.filter(({ id }) => id !== organization.id)
        : [...selectedOrganizations, organization]
    );
  };

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
      {unregisteredClientHost && (
        <UnregisteredClientNotice
          className={styles.unregisteredClientNotice}
          host={unregisteredClientHost}
        />
      )}
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
      {/* An unregistered (CIMD) client consents a single organization per authorization and keeps its per-organization scope breakdown; a registered client consents an amendable multi-select roster. */}
      {consentData.organizations &&
        (unregisteredClientHost ? (
          <OrganizationSelector
            className={styles.organizationSelector}
            organizations={consentData.organizations}
            selectedOrganization={selectedOrganizations[0]}
            onSelect={(organization) => {
              setSelectedOrganizations([organization]);
            }}
          />
        ) : (
          <OrganizationRoster
            className={styles.organizationSelector}
            organizations={consentData.organizations}
            selectedOrganizations={selectedOrganizations}
            resourceScopes={consentData.organizationResourceScopes}
            onToggle={toggleOrganization}
          />
        ))}
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
              name: applicationName,
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
              name: applicationName,
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
