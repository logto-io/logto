import LogtoSignature from '@experience/shared/components/LogtoSignature';
import { useContext } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';

import styles from './index.module.scss';

const PageFooter = () => {
  const { t } = useTranslation();
  const { theme, experienceSettings } = useContext(PageContext);
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;
  const { termsOfUseUrl, privacyPolicyUrl, supportEmail, supportWebsiteUrl } =
    experienceSettings ?? {};
  // Use `||` to treat empty string as missing so the mailto fallback works
  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
  const supportLink = supportWebsiteUrl || (supportEmail ? `mailto:${supportEmail}` : undefined);

  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        {termsOfUseUrl && (
          <a href={termsOfUseUrl} target="_blank" rel="noopener noreferrer">
            {t('description.terms_of_use')}
          </a>
        )}
        {privacyPolicyUrl && (
          <a href={privacyPolicyUrl} target="_blank" rel="noopener noreferrer">
            {t('description.privacy_policy')}
          </a>
        )}
        {supportLink && (
          <a href={supportLink} target="_blank" rel="noopener noreferrer">
            {t('account_center.page.support')}
          </a>
        )}
      </div>
      {!hideLogtoBranding && <LogtoSignature className={styles.signature} theme={theme} />}
    </footer>
  );
};

export default PageFooter;
