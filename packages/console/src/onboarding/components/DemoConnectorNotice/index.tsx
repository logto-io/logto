import { useTranslation } from 'react-i18next';

import InlineNotification from '@/ds-components/InlineNotification';

import * as styles from './index.module.scss';

function DemoConnectorNotice() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <InlineNotification className={styles.notice}>
      {t('cloud.sie.connectors.notice')}
    </InlineNotification>
  );
}

export default DemoConnectorNotice;
