import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import type { TFuncKey } from 'react-i18next';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import BrandingHeader from '@/components/BrandingHeader';
import PageMeta from '@/components/PageMeta';
import { layoutClassNames } from '@/utils/consts';
import { getBrandingLogoUrl } from '@/utils/logo';

import AppNotification from '../../containers/AppNotification';

import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
  title: TFuncKey;
};

const LandingPageLayout = ({ children, className, title }: Props) => {
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
      <PageMeta titleKey={title} />
      {platform === 'web' && <div className={styles.placeholderTop} />}
      <div className={classNames(styles.wrapper, className)}>
        <BrandingHeader
          className={classNames(styles.header, layoutClassNames.brandingHeader)}
          headline={title}
          logo={getBrandingLogoUrl({ theme, branding, isDarkModeEnabled })}
        />
        {children}
      </div>
      {platform === 'web' && <div className={styles.placeholderBottom} />}
      <AppNotification />
    </>
  );
};

export default LandingPageLayout;
