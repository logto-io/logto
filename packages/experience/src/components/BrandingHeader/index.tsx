import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { type ReactNode } from 'react';

import ConnectIcon from '@/assets/icons/connect-icon.svg?react';
import DynamicT from '@/shared/components/DynamicT';

import styles from './index.module.scss';

export type Props = {
  readonly className?: string;
  readonly logo?: Nullable<string>;
  readonly thirdPartyLogo?: Nullable<string>;
  readonly headline?: TFuncKey;
  readonly headlineText?: string;
  readonly headlineInterpolation?: Record<string, unknown>;
  readonly subHeadline?: ReactNode;
};

const BrandingHeader = ({
  logo,
  thirdPartyLogo,
  headline,
  headlineText,
  headlineInterpolation,
  subHeadline,
  className,
}: Props) => {
  const shouldShowLogo = Boolean(thirdPartyLogo ?? logo);
  const shouldConnectSvg = Boolean(thirdPartyLogo && logo);

  return (
    <div className={classNames(styles.container, className)}>
      {shouldShowLogo && (
        <div className={styles.logoWrapper}>
          {thirdPartyLogo && (
            <img className={styles.logo} alt="third party logo" src={thirdPartyLogo} />
          )}
          {shouldConnectSvg && <ConnectIcon className={styles.connectIcon} />}
          {logo && <img className={styles.logo} alt="app logo" src={logo} />}
        </div>
      )}

      {(headlineText ?? headline) && (
        <div className={styles.headline}>
          {headlineText ?? <DynamicT forKey={headline} interpolation={headlineInterpolation} />}
        </div>
      )}

      {subHeadline && <div className={styles.subHeadline}>{subHeadline}</div>}
    </div>
  );
};

export default BrandingHeader;
