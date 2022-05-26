import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import emailConnectorIcon from '@/assets/images/connector-email.svg';
import smsConnectorIcon from '@/assets/images/connector-sms.svg';
import ItemPreview from '@/components/ItemPreview';
import UnnamedTrans from '@/components/UnnamedTrans';

import * as styles from './index.module.scss';

type Props = {
  type: ConnectorType;
  connector?: ConnectorDTO;
};

const ConnectorName = ({ type, connector }: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const titlePlaceholder = useMemo(() => {
    if (type === ConnectorType.Email) {
      return t('connectors.type.email');
    }

    if (type === ConnectorType.SMS) {
      return t('connectors.type.sms');
    }

    return t('connectors.type.social');
  }, [type, t]);

  const iconPlaceholder = useMemo(() => {
    if (type === ConnectorType.Email) {
      return emailConnectorIcon;
    }

    if (type === ConnectorType.SMS) {
      return smsConnectorIcon;
    }
  }, [type]);

  if (!connector) {
    return <ItemPreview title={titlePlaceholder} icon={<img src={iconPlaceholder} />} />;
  }

  return (
    <Link to={`/connectors/${connector.id}`} className={styles.link}>
      <ItemPreview
        title={<UnnamedTrans resource={connector.name} />}
        subtitle={connector.id}
        icon={<img className={styles.logo} src={connector.logo} />}
      />
    </Link>
  );
};

export default ConnectorName;
