import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';

import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

export type Props = {
  className?: string;
  logo?: Nullable<string>;
  headline?: TFuncKey;
};

const BrandingHeader = ({ logo, headline, className }: Props) => {
  return (
    <div className={classNames(styles.container, className)}>
      {logo && <img className={styles.logo} alt="app logo" src={logo} crossOrigin="anonymous" />}
      {headline && (
        <div className={styles.headline}>
          <DynamicT forKey={headline} />
        </div>
      )}
    </div>
  );
};

export default BrandingHeader;
