import classNames from 'classnames';

import * as styles from './index.module.scss';

type Props = {
  readonly isActive?: boolean;
};

function John({ isActive = true }: Props) {
  return (
    <svg
      className={classNames(styles.vector, isActive && styles.active)}
      width="190"
      height="200"
      viewBox="0 0 190 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: 'translateY(90px)' }}
    >
      <path
        d="M186.704 11.589L183.121 9.50968L183.114 13.6504L186.704 11.589ZM0.233412 11.4807L183.476 11.9395L183.477 11.2223L0.234605 10.7635L0.233412 11.4807Z"
        fill="#8E9192"
      />
      <rect
        className={styles.textWrapper}
        width="107"
        height="24"
        transform="translate(41.8317 0.121582)"
      />
      <text className={styles.text} x="48" y="15">
        john@email.com
      </text>
      <path
        d="M185.27 186.451L181.684 188.521V184.381L185.27 186.451ZM21.3918 11.4565V177.845H20.6746V11.4565H21.3918ZM29.6395 186.092H182.042V186.809H29.6395V186.092ZM21.3918 177.845C21.3918 182.4 25.0844 186.092 29.6395 186.092V186.809C24.6883 186.809 20.6746 182.796 20.6746 177.845H21.3918Z"
        fill="#8E9192"
      />
      <rect
        className={styles.textWrapper}
        width="107"
        height="24"
        transform="translate(41.8317 175.693)"
      />
      <text className={styles.text} x="48" y="190">
        john@email.com
      </text>
    </svg>
  );
}

export default John;
