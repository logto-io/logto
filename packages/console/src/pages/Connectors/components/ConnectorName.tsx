import { ConnectorDTO } from '@logto/schemas';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import ImagePlaceholder from '@/components/ImagePlaceholder';
import ItemPreview from '@/components/ItemPreview';

import * as styles from './ConnectorName.module.scss';

type Props = {
  connector?: ConnectorDTO;
  titlePlaceholder?: string;
};

const ConnectorName = ({ connector, titlePlaceholder = '' }: Props) => {
  const {
    i18n: { language },
  } = useTranslation();

  if (!connector) {
    return <ItemPreview title={titlePlaceholder} icon={<ImagePlaceholder />} />;
  }

  return (
    <Link to={`/connectors/${connector.id}`} className={styles.link}>
      <ItemPreview
        title={connector.metadata.name[language] ?? connector.metadata.name.en ?? '-'}
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
