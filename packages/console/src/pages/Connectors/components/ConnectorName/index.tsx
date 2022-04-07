import { ConnectorDTO } from '@logto/schemas';
import React from 'react';
import { Link } from 'react-router-dom';

import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';
import UnnamedTrans from '@/components/UnnamedTrans';

import * as styles from './index.module.scss';

type Props = {
  connector?: ConnectorDTO;
  titlePlaceholder?: string;
};

const ConnectorName = ({ connector, titlePlaceholder = '' }: Props) => {
  if (!connector) {
    return <ItemPreview title={titlePlaceholder} icon={<ImagePlaceholder />} />;
  }

  return (
    <Link to={`/connectors/${connector.id}`} className={styles.link}>
      <ItemPreview
        title={<UnnamedTrans resource={connector.metadata.name} />}
        subtitle={connector.id}
        icon={
          connector.metadata.logo.startsWith('http') ? (
            <img className={styles.logo} src={connector.metadata.logo} />
          ) : (
            <ImagePlaceholder />
          )
        }
      />
    </Link>
  );
};

export default ConnectorName;
