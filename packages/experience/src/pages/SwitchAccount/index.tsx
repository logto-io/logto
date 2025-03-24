import { type ConsentInfoResponse } from '@logto/schemas';
import { useContext, useEffect, useState } from 'react';

import StaticPageLayout from '@/Layout/StaticPageLayout';
import PageContext from '@/Providers/PageContextProvider/PageContext';
import { getConsentInfo } from '@/apis/consent';
import Button from '@/components/Button';
import DynamicT from '@/components/DynamicT';
import LoadingLayer from '@/components/LoadingLayer';
import PageMeta from '@/components/PageMeta';
import TextLink from '@/components/TextLink';
import useApi from '@/hooks/use-api';
import useErrorHandler from '@/hooks/use-error-handler';
import UserProfile from '@/pages/Consent/UserProfile';
import ErrorPage from '@/pages/ErrorPage';
import { getBrandingLogoUrl } from '@/utils/logo';

import styles from './index.module.scss';

/**
 * This component is only used when there's an active session, and then the user
 * is trying to sign-in with another account (e.g., using a magic link).
 */

type Props = {
  /**
   * The account name of the current active session
   */
  readonly account: string;
  /**
   * The callback function to be called after clicking the "Go back" link
   */
  readonly onCancel: () => Promise<void>;
  /**
   * The callback function to be called after clicking the "Switch" button
   */
  readonly onSwitch: () => Promise<void>;
};

const SwitchAccount = ({ account, onCancel, onSwitch }: Props) => {
  const { experienceSettings, theme } = useContext(PageContext);
  const handleError = useErrorHandler();

  const [consentData, setConsentData] = useState<ConsentInfoResponse>();
  const asyncGetConsentInfo = useApi(getConsentInfo);

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

  if (!account) {
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
          <DynamicT forKey="description.switch_account_title" interpolation={{ account }} />
        </div>
        <UserProfile user={consentData.user} className={styles.userProfile} />
        <div className={styles.message}>
          <DynamicT forKey="description.switch_account_description" />
        </div>
        <Button
          className={styles.button}
          type="primary"
          size="large"
          title="action.switch_to"
          i18nProps={{ method: account }}
          onClick={onSwitch}
        />
        <div className={styles.linkButton}>
          <TextLink text="action.back_to_current_account" onClick={onCancel} />
        </div>
      </div>
    </StaticPageLayout>
  );
};

export default SwitchAccount;
