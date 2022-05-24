import { ConnectorDTO } from '@logto/schemas';
import React from 'react';
import { Link } from 'react-router-dom';

import ItemPreview from '@/components/ItemPreview';
import UnnamedTrans from '@/components/UnnamedTrans';

import * as styles from './index.module.scss';

type Props = {
  connector?: ConnectorDTO;
  titlePlaceholder?: string;
  iconPlaceholder?: string;
};

const ConnectorName = ({ connector, titlePlaceholder = '', iconPlaceholder }: Props) => {
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
