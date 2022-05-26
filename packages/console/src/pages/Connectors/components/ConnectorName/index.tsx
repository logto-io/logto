import { ConnectorDTO, ConnectorType } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ItemPreview from '@/components/ItemPreview';
import UnnamedTrans from '@/components/UnnamedTrans';
import { connectorIconPlaceHolder, connectorTitlePlaceHolder } from '@/consts/connectors';

import * as styles from './index.module.scss';

type Props = {
  type: ConnectorType;
  connector?: ConnectorDTO;
};

const ConnectorName = ({ type, connector }: Props) => {
  const { t } = useTranslation(undefined);

  if (!connector) {
    return (
      <ItemPreview
        title={t(connectorTitlePlaceHolder[type])}
        icon={<img src={connectorIconPlaceHolder[type]} />}
      />
    );
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
