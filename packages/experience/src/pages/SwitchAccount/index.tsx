import { experience, type ConsentInfoResponse } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import { getConsentInfo } from '@/apis/consent';
import TextLink from '@/components/TextLink';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import UserProfile from '@/pages/Consent/UserProfile';
import ErrorPage from '@/pages/ErrorPage';
import Button from '@/shared/components/Button';
import DynamicT from '@/shared/components/DynamicT';
import LoadingLayer from '@/shared/components/LoadingLayer';
import PageMeta from '@/shared/components/PageMeta';
import { getBrandingLogoUrl } from '@/utils/logo';

import styles from './index.module.scss';

/**
 * This component is only used when there's an active session, and then the user
 * is trying to sign-in with another account (e.g., using a magic link).
 */
const SwitchAccount = () => {
  const { experienceSettings, theme } = useContext(PageContext);
  const navigate = useNavigateWithPreservedSearchParams();
  const handleError = useErrorHandler();

  const [consentData, setConsentData] = useState<ConsentInfoResponse>();
  const asyncGetConsentInfo = useApi(getConsentInfo);

  const [params] = useSearchParams();
  const loginHint = params.get('login_hint');

  useEffect(() => {
    (async () => {
      const [error, result] = await asyncGetConsentInfo();

      if (error) {
        await handleError(error);
        return;
      }
      setConsentData(result);
    })();
  }, [asyncGetConsentInfo, handleError]);

  if (!loginHint) {
    return <ErrorPage title="error.unknown" message="error.unknown" />;
  }

  if (!experienceSettings || !consentData) {
    return <LoadingLayer />;
  }

  const {
    color: { isDarkModeEnabled },
    branding,
  } = experienceSettings;
  const logoUrl = getBrandingLogoUrl({ theme, branding, isDarkModeEnabled });

  return (
    <StaticPageLayout>
      <PageMeta titleKey="description.switch_account" />
      <div className={styles.container}>
        {logoUrl && <img className={styles.logo} src={logoUrl} alt="app logo" />}
        <div className={styles.title}>
          <DynamicT
            forKey="description.switch_account_title"
            interpolation={{ account: consentData.user.primaryEmail }}
          />
        </div>
        <UserProfile user={consentData.user} className={styles.userProfile} />
        <div className={styles.message}>
          <DynamicT forKey="description.switch_account_description" />
        </div>
        <Button
          className={styles.button}
          type="primary"
          size="large"
          title="action.continue_as"
          i18nProps={{ name: loginHint }}
          onClick={() => {
            navigate(
              { pathname: `/${experience.routes.oneTimeToken}`, search: `?${params.toString()}` },
              { replace: true }
            );
          }}
        />
        <div className={styles.linkButton}>
          <TextLink
            text="action.back_to_current_account"
            onClick={async () => {
              history.back();
            }}
          />
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default SwitchAccount;
