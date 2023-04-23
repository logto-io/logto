import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import * as styles from './index.module.scss';

export type Props = {
  className?: string;
  logo?: Nullable<string>;
  headline?: TFuncKey;
};

const BrandingHeader = ({ logo, headline, className }: Props) => {
  const { t } = useTranslation();

  return (
    <div className={classNames(styles.container, className)}>
      {logo && <img className={styles.logo} alt="app logo" src={logo} crossOrigin="anonymous" />}
      {headline && <div className={styles.headline}>{t(headline)}</div>}
    </div>
  );
};

export default BrandingHeader;
