import { Theme } from '@logto/schemas';
import type { ConnectorResponse } from '@logto/schemas';
import classNames from 'classnames';

import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import useTheme from '@/hooks/use-theme';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
  readonly data: Pick<ConnectorResponse, 'logo' | 'logoDark'>;
  readonly size?: 'small' | 'medium' | 'large';
};

function ConnectorLogo({ className, data, size = 'medium' }: Props) {
  const theme = useTheme();

  return (
    <ImageWithErrorFallback
      containerClassName={classNames(styles.container, styles[size])}
      className={classNames(styles.logo, styles[size], className)}
      alt="logo"
      src={theme === Theme.Dark && data.logoDark ? data.logoDark : data.logo}
    />
  );
}

export default ConnectorLogo;
