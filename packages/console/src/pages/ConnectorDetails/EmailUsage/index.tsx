import { Theme } from '@logto/schemas';
import { Trans, useTranslation } from 'react-i18next';

import EmailSentIconDark from '@/assets/icons/email-sent-dark.svg?react';
import EmailSentIconLight from '@/assets/icons/email-sent.svg?react';
import Tip from '@/assets/icons/tip.svg?react';
import DynamicT from '@/ds-components/DynamicT';
import IconButton from '@/ds-components/IconButton';
import TextLink from '@/ds-components/TextLink';
import { ToggleTip } from '@/ds-components/Tip';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

type Props = {
  readonly usage: number;
  readonly isCompact?: boolean;
};

function EmailUsage({ usage, isCompact }: Props) {
  const theme = useTheme();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getDocumentationUrl } = useDocumentationUrl();
  return (
    <div className={styles.container}>
      {theme === Theme.Light ? <EmailSentIconLight /> : <EmailSentIconDark />}
      {isCompact ? (
        usage
      ) : (
        <DynamicT
          forKey="connector_details.logto_email.total_email_sent"
          interpolation={{ value: usage }}
        />
      )}
      <ToggleTip
        content={(closeTipHandler) => (
          <Trans
            components={{
              a: (
                <TextLink
                  href={getDocumentationUrl(
                    'docs/recipes/configure-connectors/email-connector/configure-logto-email-service'
                  )}
                  targetBlank="noopener"
                  onClick={closeTipHandler}
                />
              ),
            }}
          >
            {t('connector_details.logto_email.total_email_sent_tip')}
          </Trans>
        )}
      >
        <IconButton size="small">
          <Tip />
        </IconButton>
      </ToggleTip>
    </div>
  );
}

export default EmailUsage;
