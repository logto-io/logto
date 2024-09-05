import classNames from 'classnames';

import LoadingSvg from '@/assets/icons/loading-icon.svg?react';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

const LoadingIcon = ({ className }: Props) => (
  <LoadingSvg className={classNames(styles.loadingIcon, className)} />
);

export default LoadingIcon;
