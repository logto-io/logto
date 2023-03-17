import { useTranslation } from 'react-i18next';

import Alert from '@/components/Alert';

import * as styles from './index.module.scss';

const DemoConnectorNotice = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.container}>
      <Alert className={styles.notice}>{t('cloud.sie.connectors.notice')}</Alert>
    </div>
  );
};

export default DemoConnectorNotice;
