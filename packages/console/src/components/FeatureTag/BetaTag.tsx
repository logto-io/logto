import classNames from 'classnames';

/**
 * BetaTag static component
 *
 * Used to indicate that a new released feature is in beta.
 */

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function BetaTag({ className }: Props) {
  return <div className={classNames(styles.tag, styles.beta, className)}>Beta</div>;
}

export default BetaTag;
