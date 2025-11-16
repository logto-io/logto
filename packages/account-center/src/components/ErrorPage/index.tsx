import EmptyStateDark from '@experience/assets/icons/empty-state-dark.svg';
import EmptyState from '@experience/assets/icons/empty-state.svg';
import DynamicT from '@experience/shared/components/DynamicT';
import PageMeta from '@experience/shared/components/PageMeta';
import { Theme } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import { useContext } from 'react';
import { Trans } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';

import styles from './index.module.scss';

type Props = {
  readonly titleKey?: TFuncKey;
  readonly messageKey?: TFuncKey;
  readonly rawMessage?: string;
};

const SupportInfo = () => {
  const { experienceSettings } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const { supportEmail, supportWebsiteUrl } = experienceSettings;

  if (!supportEmail && !supportWebsiteUrl) {
    return null;
  }

  return (
    <div className={styles.support}>
      {supportEmail && (
        <div className={styles.supportItem}>
          <Trans
            i18nKey="description.support_email"
            components={{
              link: (
                <a className={styles.supportLink} href={`mailto:${supportEmail}`}>
                  {supportEmail}
                </a>
              ),
            }}
          />
        </div>
      )}
      {supportWebsiteUrl && (
        <div className={styles.supportItem}>
          <Trans
            i18nKey="description.support_website"
            components={{
              link: (
                <a
                  className={styles.supportLink}
                  href={supportWebsiteUrl}
                  rel="noopener"
                  target="_blank"
                >
                  {supportWebsiteUrl}
                </a>
              ),
            }}
          />
        </div>
      )}
    </div>
  );
};

const ErrorPage = ({ titleKey = 'description.not_found', messageKey, rawMessage }: Props) => {
  const { theme } = useContext(PageContext);
  const message = rawMessage ?? (messageKey ? <DynamicT forKey={messageKey} /> : undefined);
  const illustration = theme === Theme.Light ? EmptyState : EmptyStateDark;

  return (
    <div className={styles.errorPage}>
      <PageMeta titleKey={titleKey} />
      <div className={styles.illustration}>
        <img src={illustration} alt="" role="presentation" />
      </div>
      <div className={styles.title}>
        <DynamicT forKey={titleKey} />
      </div>
      {message && <div className={styles.message}>{message}</div>}
      <SupportInfo />
    </div>
  );
};

export default ErrorPage;
