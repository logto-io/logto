import { type ConsentInfoResponse } from '@logto/schemas';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import type { ReactNode } from 'react';
import { useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import BrandingHeader from '@/components/BrandingHeader';
import PageMeta from '@/components/PageMeta';
import { layoutClassNames } from '@/utils/consts';
import { getBrandingLogoUrl } from '@/utils/logo';

import styles from './index.module.scss';

type ThirdPartyBranding = ConsentInfoResponse['application']['branding'];

type Props = {
  readonly children: ReactNode;
  readonly className?: string;
  readonly title: TFuncKey;
  readonly titleInterpolation?: Record<string, unknown>;
  readonly thirdPartyBranding?: ThirdPartyBranding;
};

const LandingPageLayout = ({
  children,
  className,
  title,
  titleInterpolation,
  thirdPartyBranding,
}: Props) => {
  const { experienceSettings, theme, platform } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const {
    color: { isDarkModeEnabled },
    branding,
  } = experienceSettings;

  return (
    <>
      <PageMeta titleKey={title} titleKeyInterpolation={titleInterpolation} />
      {platform === 'web' && <div className={styles.placeholderTop} />}
      <div className={classNames(styles.wrapper, className)}>
        <BrandingHeader
          className={classNames(styles.header, layoutClassNames.brandingHeader)}
          headline={title}
          headlineInterpolation={titleInterpolation}
          logo={getBrandingLogoUrl({ theme, branding, isDarkModeEnabled })}
          thirdPartyLogo={
            thirdPartyBranding &&
            getBrandingLogoUrl({ theme, branding: thirdPartyBranding, isDarkModeEnabled })
          }
        />
        {children}
      </div>
      {platform === 'web' && <div className={styles.placeholderBottom} />}
    </>
  );
};

export default LandingPageLayout;
