import { ConnectorType } from '@logto/connector-kit';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@/components/Tip';

import * as styles from './DemoTag.module.scss';

type Props = {
  connectorType: ConnectorType;
};

const DemoTag = ({ connectorType }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const isSocial = connectorType === ConnectorType.Social;

  return (
    <Tooltip
      content={<div>{t(isSocial ? 'connectors.social_demo_tip' : 'connectors.demo_tip')}</div>}
    >
      <div className={styles.tag}>{t('general.demo')}</div>
    </Tooltip>
  );
};

export default DemoTag;
