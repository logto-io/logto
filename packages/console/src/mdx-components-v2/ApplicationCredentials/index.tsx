import { Trans, useTranslation } from 'react-i18next';

import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

type Props = {
  id: string;
  secret: string;
};

function ApplicationCredentials({ id, secret }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <FormField
        title="application_details.application_id"
        tip={(closeTipHandler) => (
          <Trans
            components={{
              a: (
                <TextLink
                  href="https://openid.net/specs/openid-connect-core-1_0.html"
                  target="_blank"
                  onClick={closeTipHandler}
                />
              ),
            }}
          >
            {t('application_details.application_id_tip')}
          </Trans>
        )}
      >
        <CopyToClipboard value={id} variant="border" className={styles.textField} />
      </FormField>
      <FormField title="application_details.application_secret">
        <CopyToClipboard
          hasVisibilityToggle
          value={secret}
          variant="border"
          className={styles.textField}
        />
      </FormField>
    </div>
  );
}

export default ApplicationCredentials;
