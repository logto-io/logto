import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly isActive?: boolean;
};

function Sarah({ isActive }: Props) {
  return (
    <svg
      className={classNames(styles.vector, isActive && styles.active)}
      width="187"
      height="25"
      viewBox="0 0 187 25"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M186.704 10.8857L183.118 8.81539V12.9561L186.704 10.8857ZM0.234619 11.2443L183.477 11.2443V10.5271L0.234619 10.5271L0.234619 11.2443Z"
        fill="#8E9192"
      />
      <rect
        className={styles.textWrapper}
        width="108"
        height="24"
        transform="translate(41.8317 0.326172)"
      />
      <text className={styles.text} x="47" y="14">
        sarah@email.com
      </text>
    </svg>
  );
}

export default Sarah;
