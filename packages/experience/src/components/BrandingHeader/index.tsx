import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';

import ConnectIcon from '@/assets/icons/connect-icon.svg';

import DynamicT from '../DynamicT';

import * as styles from './index.module.scss';

export type Props = {
  readonly className?: string;
  readonly logo?: Nullable<string>;
  readonly thirdPartyLogo?: Nullable<string>;
  readonly headline?: TFuncKey;
  readonly headlineInterpolation?: Record<string, unknown>;
};

const BrandingHeader = ({
  logo,
  thirdPartyLogo,
  headline,
  headlineInterpolation,
  className,
}: Props) => {
  const shouldShowLogo = Boolean(thirdPartyLogo ?? logo);
  const shouldConnectSvg = Boolean(thirdPartyLogo && logo);

  return (
    <div className={classNames(styles.container, className)}>
      {shouldShowLogo && (
        <div className={styles.logoWrapper}>
          {thirdPartyLogo && (
            <img
              className={styles.logo}
              alt="third party logo"
              src={thirdPartyLogo}
              crossOrigin="anonymous"
            />
          )}
          {shouldConnectSvg && <ConnectIcon className={styles.connectIcon} />}
          {logo && (
            <img className={styles.logo} alt="app logo" src={logo} crossOrigin="anonymous" />
          )}
        </div>
      )}

      {headline && (
        <div className={styles.headline}>
          <DynamicT forKey={headline} interpolation={headlineInterpolation} />
        </div>
      )}
    </div>
  );
};

export default BrandingHeader;
