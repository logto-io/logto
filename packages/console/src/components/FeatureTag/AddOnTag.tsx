import classNames from 'classnames';

/**
 * AddOnTag static component
 *
 * Used to indicate that a feature is add-on feature and will be charged according to usage.
 */

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function AddOnTag({ className }: Props) {
  return <div className={classNames(styles.tag, styles.beta, className)}>Add-on</div>;
}

export default AddOnTag;
