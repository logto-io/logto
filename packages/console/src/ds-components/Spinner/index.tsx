import classNames from 'classnames';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

function Ring({ className }: Props) {
  return (
    <svg
      className={classNames(styles.ring, className)}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M9.33566 14.8714C9.44104 15.4135 9.08652 15.9451 8.53547 15.9821C7.4048 16.0579 6.2669 15.8929 5.19834 15.4934C3.81639 14.9767 2.60425 14.0879 1.69591 12.9253C0.78758 11.7627 0.218443 10.3715 0.0514252 8.90563C-0.115592 7.43973 0.126015 5.9562 0.749537 4.61905C1.37306 3.28191 2.35421 2.14323 3.5845 1.32891C4.8148 0.514598 6.24632 0.0563637 7.7208 0.00487344C9.19528 -0.0466168 10.6553 0.310643 11.9394 1.03715C12.9323 1.59891 13.7901 2.36452 14.4588 3.27942C14.7847 3.72531 14.6054 4.33858 14.1223 4.60633C13.6393 4.87408 13.0366 4.69278 12.6924 4.26086C12.2154 3.66218 11.6262 3.15785 10.9545 2.77787C9.99146 2.23298 8.89646 1.96504 7.7906 2.00366C6.68474 2.04227 5.6111 2.38595 4.68838 2.99669C3.76565 3.60742 3.02979 4.46143 2.56215 5.46429C2.09451 6.46715 1.91331 7.5798 2.03857 8.67922C2.16383 9.77864 2.59069 10.822 3.27194 11.694C3.95319 12.5659 4.8623 13.2325 5.89876 13.62C6.62154 13.8903 7.38663 14.0175 8.15188 13.9981C8.70399 13.9841 9.23028 14.3293 9.33566 14.8714Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Daisy({ className }: Props) {
  return (
    <svg
      className={classNames(styles.daisy, className)}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect opacity="0.48" x="15" width="2" height="8" rx="1" fill="currentColor" />
      <rect opacity="0.96" x="15" y="24" width="2" height="8" rx="1" fill="currentColor" />
      <rect
        opacity="0.72"
        y="17"
        width="2"
        height="8"
        rx="1"
        transform="rotate(-90 0 17)"
        fill="currentColor"
      />
      <rect
        opacity="0.24"
        x="24"
        y="17"
        width="2"
        height="8"
        rx="1"
        transform="rotate(-90 24 17)"
        fill="currentColor"
      />
      <rect
        opacity="0.32"
        x="29.3564"
        y="7.13403"
        width="2"
        height="8"
        rx="1"
        transform="rotate(60 29.3564 7.13403)"
        fill="currentColor"
      />
      <rect
        opacity="0.8"
        x="8.57227"
        y="19.134"
        width="2"
        height="8"
        rx="1"
        transform="rotate(60 8.57227 19.134)"
        fill="currentColor"
      />
      <rect
        opacity="0.64"
        x="1.64355"
        y="8.86597"
        width="2"
        height="8"
        rx="1"
        transform="rotate(-60 1.64355 8.86597)"
        fill="currentColor"
      />
      <rect
        opacity="0.16"
        x="22.4277"
        y="20.866"
        width="2"
        height="8"
        rx="1"
        transform="rotate(-60 22.4277 20.866)"
        fill="currentColor"
      />
      <rect
        opacity="0.4"
        x="23.1338"
        y="1.64355"
        width="2"
        height="8"
        rx="1"
        transform="rotate(30 23.1338 1.64355)"
        fill="currentColor"
      />
      <rect
        opacity="0.88"
        x="11.1338"
        y="22.4282"
        width="2"
        height="8"
        rx="1"
        transform="rotate(30 11.1338 22.4282)"
        fill="currentColor"
      />
      <rect
        opacity="0.56"
        x="7.13379"
        y="2.64355"
        width="2"
        height="8"
        rx="1"
        transform="rotate(-30 7.13379 2.64355)"
        fill="currentColor"
      />
      <rect
        opacity="0.08"
        x="19.1338"
        y="23.4282"
        width="2"
        height="8"
        rx="1"
        transform="rotate(-30 19.1338 23.4282)"
        fill="currentColor"
      />
    </svg>
  );
}

export { Ring, Daisy };
