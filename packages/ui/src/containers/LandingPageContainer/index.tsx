import { BrandingStyle } from '@logto/schemas';
import classNames from 'classnames';
import type { ReactNode } from 'react';
import { useContext } from 'react';

import BrandingHeader from '@/components/BrandingHeader';
import { PageContext } from '@/hooks/use-page-context';
import { getLogoUrl } from '@/utils/logo';

import AppNotification from '../AppNotification';
import * as styles from './index.module.scss';

type Props = {
  children: ReactNode;
  className?: string;
};

const LandingPageContainer = ({ children, className }: Props) => {
  const { experienceSettings, theme, platform } = useContext(PageContext);

  if (!experienceSettings) {
    return null;
  }

  const { slogan, logoUrl, darkLogoUrl, style } = experienceSettings.branding;

  return (
    <>
      {platform === 'web' && <div className={styles.placeholderTop} />}
      <div className={classNames(styles.wrapper, className)}>
        <BrandingHeader
          className={styles.header}
          headline={style === BrandingStyle.Logo_Slogan ? slogan : undefined}
          logo={getLogoUrl({ theme, logoUrl, darkLogoUrl })}
        />
        {children}
      </div>
      {platform === 'web' && <div className={styles.placeholderBottom} />}
      <AppNotification />
    </>
  );
};

export default LandingPageContainer;
