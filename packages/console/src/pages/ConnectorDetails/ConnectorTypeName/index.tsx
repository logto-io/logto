import { ConnectorType } from '@logto/schemas';
import { useTranslation } from 'react-i18next';

import Tag from '@/ds-components/Tag';

type Props = {
  type: ConnectorType;
};

 // TODO: update locales, replace any with TFuncKey<'translations', 'admin_console'>
const textMap: Record<ConnectorType, any> = {
  [ConnectorType.Email]: 'connector_details.type_email',
  [ConnectorType.Sms]: 'connector_details.type_sms',
  [ConnectorType.Social]: 'connector_details.type_social',
  [ConnectorType.Blockchain]: 'connector_details.type_blockchain',
}


function ConnectorTypeName({ type }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  
  return (
    <Tag>
      {t(textMap[type])}
    </Tag>
  );
}

export default ConnectorTypeName;
