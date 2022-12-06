import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ToggleTipButton from '@/components/ToggleTipButton';

import * as styles from './index.module.scss';

const ConnectorStatusField = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.field}>
      {t('connectors.connector_status')}
      <ToggleTipButton
        tipHorizontalAlignment="center"
        className={styles.tipButton}
        render={(closeTipHandler) => (
          <>
            <div className={styles.title}>{t('connectors.connector_status')}</div>
            <div className={styles.content}>
              <Trans
                components={{
                  a: (
                    <Link
                      to="/sign-in-experience/sign-up-and-sign-in"
                      target="_blank"
                      onClick={closeTipHandler}
                    />
                  ),
                }}
              >
                {t('connectors.not_in_use_tip.content', {
                  link: t('connectors.not_in_use_tip.go_to_sie'),
                })}
              </Trans>
            </div>
          </>
        )}
      />
    </div>
  );
};

export default ConnectorStatusField;
