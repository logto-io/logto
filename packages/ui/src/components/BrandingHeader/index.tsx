import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import type { TFuncKey } from 'react-i18next';

import * as styles from './index.module.scss';

export type Props = {
  className?: string;
  logo?: Nullable<string>;
  headline?: TFuncKey;
};

const BrandingHeader = ({ logo, headline, className }: Props) => {
  const { t } = useTranslation();
  console.log('brandingLogo', logo);

  return (
    <div className={classNames(styles.container, className)}>
      {logo && <img className={styles.logo} alt="app logo" src={logo} />}
      {headline && <div className={styles.headline}>{t(headline)}</div>}
    </div>
  );
};

export default BrandingHeader;
