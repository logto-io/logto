import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { useState } from 'react';

import ConnectIcon from '@/assets/icons/connect-icon.svg?react';
import FallbackAppLogo from '@/assets/icons/fallback-app-logo.svg?react';
import DynamicT from '@/shared/components/DynamicT';

import styles from './index.module.scss';

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
  /**
   * The third-party logo is a remote asset the client declares (e.g. a CIMD client's `logo_uri`),
   * loaded with no user interaction: `no-referrer` keeps it from carrying the tenant origin to
   * that host, and a load failure falls back to a placeholder so the header keeps its shape.
   */
  const [isThirdPartyLogoBroken, setIsThirdPartyLogoBroken] = useState(false);
  const shouldShowLogo = Boolean(thirdPartyLogo ?? logo);
  const shouldConnectSvg = Boolean(thirdPartyLogo && logo);

  return (
    <div className={classNames(styles.container, className)}>
      {shouldShowLogo && (
        <div className={styles.logoWrapper}>
          {thirdPartyLogo &&
            (isThirdPartyLogoBroken ? (
              <FallbackAppLogo className={classNames(styles.logo, styles.thirdPartyLogo)} />
            ) : (
              <img
                className={classNames(styles.logo, styles.thirdPartyLogo)}
                alt="third party logo"
                src={thirdPartyLogo}
                referrerPolicy="no-referrer"
                onError={() => {
                  setIsThirdPartyLogoBroken(true);
                }}
              />
            ))}
          {shouldConnectSvg && <ConnectIcon className={styles.connectIcon} />}
          {logo && <img className={styles.logo} alt="app logo" src={logo} />}
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
