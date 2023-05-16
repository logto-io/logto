import { ConnectorType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Tag from '@/components/Tag';

type Props = {
  type: ConnectorType;
};

function ConnectorTypeName({ type }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <Tag>
      {type === ConnectorType.Email && t('connector_details.type_email')}
      {type === ConnectorType.Sms && t('connector_details.type_sms')}
      {type === ConnectorType.Social && t('connector_details.type_social')}
    </Tag>
  );
}

export default ConnectorTypeName;
