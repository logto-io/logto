import Logo from '@/assets/images/logo.svg?react';
import MeshxMark from '@/assets/images/meshx-mark.svg?react';

import styles from './index.module.scss';

// The viewBoxes are cropped to the drawn artwork. The asset files have empty padding, and the logo
// file also contains the brand X on its left (x 0-82), which is not part of the wordmark. Cropping
// to the wordmark's own bounds keeps the wordmark centered, so the spinner below it lines up with
// the visible text. The mark also spins around its own center, which is the drawing's center.
const logoViewBox = '110.68 32.18 345.18 68.68';
const markViewBox = '0 18 82 90';

function AppLoading() {
  return (
    <div className={styles.container}>
      <Logo className={styles.logo} viewBox={logoViewBox} />
      <MeshxMark className={styles.mark} viewBox={markViewBox} aria-label="Loading" role="img" />
    </div>
  );
}

export default AppLoading;
