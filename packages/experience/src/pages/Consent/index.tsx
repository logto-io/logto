import { ReservedResource } from '@logto/core-kit';
import { type ConsentInfoResponse } from '@logto/schemas';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import LandingPageLayout from '@/Layout/LandingPageLayout';
import { consent, getConsentInfo } from '@/apis/consent';
import Button from '@/components/Button';
import TermsLinks from '@/components/TermsLinks';
import TextLink from '@/components/TextLink';
import { isDevFeaturesEnabled } from '@/constants/env';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';

import OrganizationSelector, { type Organization } from './OrganizationSelector';
import ScopesListCard from './ScopesListCard';
import UserProfile from './UserProfile';
import * as styles from './index.module.scss';
import { getRedirectUriOrigin } from './util';

const Consent = () => {
  const handleError = useErrorHandler();
  const asyncConsent = useApi(consent);
  const { t } = useTranslation();

  const [consentData, setConsentData] = useState<ConsentInfoResponse>();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization>();

  const asyncGetConsentInfo = useApi(getConsentInfo);

  const consentHandler = useCallback(async () => {
    const [error, result] = await asyncConsent(selectedOrganization?.id);

    if (error) {
      await handleError(error);

      return;
    }

    if (result?.redirectTo) {
      window.location.replace(result.redirectTo);
    }
  }, [asyncConsent, handleError, selectedOrganization?.id]);

  useEffect(() => {
    const getConsentInfoHandler = async () => {
      const [error, result] = await asyncGetConsentInfo();

      if (error) {
        await handleError(error);

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
  }, [asyncGetConsentInfo, handleError]);

  if (!consentData) {
    return null;
  }

  const {
    application: { displayName, name, termsOfUseUrl, privacyPolicyUrl },
  } = consentData;

  const applicationName = displayName ?? name;
  const showTerms = Boolean(termsOfUseUrl ?? privacyPolicyUrl);

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
         * Todo @xiaoyijun remove dev feature flag.
         */
        resourceScopes={consentData.missingResourceScopes?.filter(
          ({ resource }) => !isDevFeaturesEnabled || resource.id !== ReservedResource.Organization
        )}
        appName={applicationName}
        className={styles.scopesCard}
        termsUrl={consentData.application.termsOfUseUrl ?? undefined}
        privacyUrl={consentData.application.privacyPolicyUrl ?? undefined}
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
        <Button
          title="action.cancel"
          type="secondary"
          onClick={() => {
            window.location.replace(consentData.redirectUri);
          }}
        />
        <Button title="action.authorize" onClick={consentHandler} />
      </div>
      {(!isDevFeaturesEnabled || !showTerms) && (
        <div className={styles.redirectUri}>
          {t('description.redirect_to', { name: getRedirectUriOrigin(consentData.redirectUri) })}
        </div>
      )}
      {isDevFeaturesEnabled && showTerms && (
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
              uri: getRedirectUriOrigin(consentData.redirectUri),
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
