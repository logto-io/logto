import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import TextLink from '@/components/TextLink';

import styles from './index.module.scss';

const TextLinkComponent = ({ href, text }: { readonly href: string; readonly text: string }) => (
  <TextLink href={href}>{text}</TextLink>
);

const SupportInfo = () => {
  const { experienceSettings } = useContext(PageContext);
  const { t } = useTranslation();

  if (!experienceSettings?.supportEmail && !experienceSettings?.supportWebsiteUrl) {
    return null;
  }

  const { supportEmail, supportWebsiteUrl } = experienceSettings;

  return (
    <div className={styles.support}>
      {supportEmail && (
        <div className={styles.message}>
          <Trans
            components={{
              link: <TextLinkComponent href={`mailto:${supportEmail}`} text={supportEmail} />,
            }}
          >
            {t('description.support_email')}
          </Trans>
        </div>
      )}
      {supportWebsiteUrl && (
        <div className={styles.message}>
          <Trans
            components={{
              link: <TextLinkComponent href={supportWebsiteUrl} text={supportWebsiteUrl} />,
            }}
          >
            {t('description.support_website')}
          </Trans>
        </div>
      )}
    </div>
  );
};

export default SupportInfo;
