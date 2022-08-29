import classNames from 'classnames';

import * as styles from './index.module.scss';

export type Props = {
  className?: string;
  logo: string;
  headline?: string;
};

const BrandingHeader = ({ logo, headline, className }: Props) => {
  return (
    <div className={classNames(styles.container, className)}>
      <img className={styles.logo} alt="app logo" src={logo} />
      {headline && <div className={styles.headline}>{headline}</div>}
    </div>
  );
};

export default BrandingHeader;
