import classNames from 'classnames';

import { LoadingIcon } from '@/components/LoadingLayer';
import useConnectors from '@/hooks/use-connectors';

import * as styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly connectorId: string;
  readonly isLoading?: boolean;
};

const SocialLanding = ({ className, connectorId, isLoading = false }: Props) => {
  const { findConnectorById, getConnectorLogo } = useConnectors();
  const result = findConnectorById(connectorId);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.connector}>
        {result ? (
          <img src={getConnectorLogo(result)} alt="logo" crossOrigin="anonymous" />
        ) : (
          connectorId
        )}
      </div>
      {isLoading && <LoadingIcon />}
    </div>
  );
};

export default SocialLanding;
