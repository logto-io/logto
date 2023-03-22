import { ConnectorType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

type Props = {
  type: ConnectorType;
};

function ConnectorTypeName({ type }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div className={styles.connectorType}>
      {type === ConnectorType.Email && t('connector_details.type_email')}
      {type === ConnectorType.Sms && t('connector_details.type_sms')}
      {type === ConnectorType.Social && t('connector_details.type_social')}
    </div>
  );
}

export default ConnectorTypeName;
