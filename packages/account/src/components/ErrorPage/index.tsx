import EmptyStateDark from '@experience/assets/icons/empty-state-dark.svg';
import EmptyState from '@experience/assets/icons/empty-state.svg';
import Button from '@experience/shared/components/Button';
import DynamicT from '@experience/shared/components/DynamicT';
import PageMeta from '@experience/shared/components/PageMeta';
import { Theme } from '@logto/schemas';
import type { TFuncKey } from 'i18next';
import type { AnchorHTMLAttributes } from 'react';
import { useContext } from 'react';
import { Trans } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';

import styles from './index.module.scss';

type SupportLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & { readonly text: string };

const SupportLink = ({ text, ...rest }: SupportLinkProps) => (
  <a {...rest} className={styles.supportLink}>
    {text}
  </a>
);

type Props = {
  readonly titleKey?: TFuncKey;
  readonly messageKey?: TFuncKey;
  readonly rawMessage?: string;
  readonly illustration?: string;
  readonly action?: {
    titleKey: TFuncKey;
    onClick: () => void;
  };
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
              link: <SupportLink href={`mailto:${supportEmail}`} text={supportEmail} />,
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
                <SupportLink
                  href={supportWebsiteUrl}
                  rel="noopener"
                  target="_blank"
                  text={supportWebsiteUrl}
                />
              ),
            }}
          />
        </div>
      )}
    </div>
  );
};

const ErrorPage = ({
  titleKey = 'description.not_found',
  messageKey,
  rawMessage,
  illustration,
  action,
}: Props) => {
  const { theme } = useContext(PageContext);
  const message = rawMessage ?? (messageKey ? <DynamicT forKey={messageKey} /> : undefined);
  const resolvedIllustration =
    illustration ?? (theme === Theme.Light ? EmptyState : EmptyStateDark);

  return (
    <div className={styles.errorPage}>
      <PageMeta titleKey={titleKey} />
      <div className={styles.illustration}>
        <img src={resolvedIllustration} alt="" role="presentation" />
      </div>
      <div className={styles.title}>
        <DynamicT forKey={titleKey} />
      </div>
      {message && <div className={styles.message}>{message}</div>}
      {action && (
        <Button className={styles.action} title={action.titleKey} onClick={action.onClick} />
      )}
      <SupportInfo />
    </div>
  );
};

export default ErrorPage;
