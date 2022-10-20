import classNames from 'classnames';
import { useContext } from 'react';

import { LoadingIcon } from '@/components/LoadingLayer';
import { PageContext } from '@/hooks/use-page-context';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  connectorId: string;
  isLoading?: boolean;
};

const SocialLanding = ({ className, connectorId, isLoading = false }: Props) => {
  const { experienceSettings, theme } = useContext(PageContext);
  const connector = experienceSettings?.socialConnectors.find(({ id }) => id === connectorId);

  return (
    <div className={classNames(styles.container, className)}>
      <div className={styles.connector}>
        {connector ? (
          <img src={theme === 'dark' ? connector.logoDark ?? connector.logo : connector.logo} />
        ) : (
          connectorId
        )}
      </div>
      {isLoading && <LoadingIcon />}
    </div>
  );
};

export default SocialLanding;
