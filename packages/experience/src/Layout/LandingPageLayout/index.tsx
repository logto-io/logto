import { type ConsentInfoResponse } from '@logto/schemas';
import classNames from 'classnames';
import type { TFuncKey } from 'i18next';
import { useContext, type ReactNode } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import BrandingHeader from '@/components/BrandingHeader';
import { getBrandingLogoUrl } from '@/shared/utils/logo';
import { layoutClassNames } from '@/utils/consts';

import FirstScreenLayout from '../FirstScreenLayout';

import styles from './index.module.scss';

type ThirdPartyBranding = ConsentInfoResponse['application']['branding'];

type Props = {
  readonly children: ReactNode;
  readonly title: TFuncKey;
  /** Visible heading when it should not be loaded from phrases. */
  readonly headlineText?: string;
  readonly titleInterpolation?: Record<string, unknown>;
  readonly thirdPartyBranding?: ThirdPartyBranding;
  readonly subTitle?: ReactNode;
};

const LandingPageLayout = ({
  children,
  title,
  headlineText,
  titleInterpolation,
  thirdPartyBranding,
  subTitle,
}: Props) => {
  const { experienceSettings, theme } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const {
    color: { isDarkModeEnabled },
    branding,
  } = experienceSettings;

  return (
    <FirstScreenLayout pageMeta={{ titleKey: title, titleKeyInterpolation: titleInterpolation }}>
      <BrandingHeader
        className={classNames(styles.header, layoutClassNames.brandingHeader)}
        headline={title}
        headlineText={headlineText}
        headlineInterpolation={titleInterpolation}
        subHeadline={subTitle}
        logo={getBrandingLogoUrl({ theme, branding, isDarkModeEnabled })}
        thirdPartyLogo={
          thirdPartyBranding &&
          getBrandingLogoUrl({ theme, branding: thirdPartyBranding, isDarkModeEnabled })
        }
      />
      {children}
    </FirstScreenLayout>
  );
};

export default LandingPageLayout;
