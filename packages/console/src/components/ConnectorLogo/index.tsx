import type { ConnectorResponse } from '@logto/schemas';
import { Theme } from '@logto/schemas';
import classNames from 'classnames';

import useTheme from '@/hooks/use-theme';

import ImageWithErrorFallback from '../ImageWithErrorFallback';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  data: Pick<ConnectorResponse, 'logo' | 'logoDark'>;
  size?: 'small' | 'medium' | 'large';
};

const ConnectorLogo = ({ className, data, size = 'medium' }: Props) => {
  const theme = useTheme();

  return (
    <ImageWithErrorFallback
      containerClassName={classNames(styles.container, styles[size])}
      className={classNames(styles.logo, styles[size], className)}
      alt="logo"
      src={theme === Theme.Dark && data.logoDark ? data.logoDark : data.logo}
    />
  );
};

export default ConnectorLogo;
