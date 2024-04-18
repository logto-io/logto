import { ConnectorType } from '@logto/connector-kit';
import { useTranslation } from 'react-i18next';

import Tag from '@/ds-components/Tag';
import { Tooltip } from '@/ds-components/Tip';

type Props = {
  readonly connectorType: ConnectorType;
};

function DemoTag({ connectorType }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isSocial = connectorType === ConnectorType.Social;

  return (
    <Tooltip
      content={<div>{t(isSocial ? 'connectors.social_demo_tip' : 'connectors.demo_tip')}</div>}
    >
      <Tag status="alert">{t('general.demo')}</Tag>
    </Tooltip>
  );
}

export default DemoTag;
