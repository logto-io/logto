import { useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { GuideContext } from '@/components/Guide';
import CopyToClipboard from '@/ds-components/CopyToClipboard';
import FormField from '@/ds-components/FormField';
import TextLink from '@/ds-components/TextLink';

import * as styles from './index.module.scss';

function ApplicationCredentials() {
  const { app } = useContext(GuideContext);
  const { id, secret } = app ?? {};
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      {id && (
        <FormField
          title="application_details.application_id"
          tip={(closeTipHandler) => (
            <Trans
              components={{
                a: (
                  <TextLink
                    targetBlank
                    href="https://openid.net/specs/openid-connect-core-1_0.html"
                    onClick={closeTipHandler}
                  />
                ),
              }}
            >
              {t('application_details.application_id_tip')}
            </Trans>
          )}
        >
          <CopyToClipboard displayType="block" value={id} variant="border" />
        </FormField>
      )}
      {secret && (
        <FormField title="application_details.application_secret">
          <CopyToClipboard
            hasVisibilityToggle
            displayType="block"
            value={secret}
            variant="border"
          />
        </FormField>
      )}
    </div>
  );
}

export default ApplicationCredentials;
