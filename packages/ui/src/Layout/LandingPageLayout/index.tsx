import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useContext } from 'react';
import type { TFuncKey } from 'react-i18next';

import BrandingHeader from '@/components/BrandingHeader';
import { PageContext } from '@/hooks/use-page-context';
import { layoutClassNames } from '@/utils/consts';
import { getBrandingLogoUrl } from '@/utils/logo';

import AppNotification from '../../containers/AppNotification';
import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
  title?: TFuncKey;
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
