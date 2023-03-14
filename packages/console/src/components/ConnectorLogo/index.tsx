import type { ConnectorResponse } from '@logto/schemas';
import classNames from 'classnames';
import { useContext } from 'react';

import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

import ImageWithErrorFallback from '../ImageWithErrorFallback';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  data: Pick<ConnectorResponse, 'logo' | 'logoDark'>;
  size?: 'small' | 'medium' | 'large';
};

const ConnectorLogo = ({ className, data, size = 'medium' }: Props) => {
  const { theme } = useContext(AppThemeContext);

  return (
    <ImageWithErrorFallback
      containerClassName={classNames(styles.container, styles[size])}
      className={classNames(styles.logo, styles[size], className)}
      alt="logo"
      src={theme === Theme.DarkMode && data.logoDark ? data.logoDark : data.logo}
    />
  );
};

export default ConnectorLogo;
