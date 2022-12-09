import { Trans, useTranslation } from 'react-i18next';

import Tip from '@/assets/images/tip.svg';
import IconButton from '@/components/IconButton';
import TextLink from '@/components/TextLink';
import { ToggleTip } from '@/components/Tip';

import * as styles from './index.module.scss';

const ConnectorStatusField = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.field}>
      {t('connectors.connector_status')}
      <ToggleTip
        anchorClassName={styles.tipButton}
        content={(closeTipHandler) => (
          <>
            <div className={styles.title}>{t('connectors.connector_status')}</div>
            <div className={styles.content}>
              <Trans
                components={{
                  a: (
                    <TextLink
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
      >
        <IconButton size="small">
          <Tip />
        </IconButton>
      </ToggleTip>
    </div>
  );
};

export default ConnectorStatusField;
