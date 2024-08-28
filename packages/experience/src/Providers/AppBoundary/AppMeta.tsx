import { conditionalString } from '@silverhand/essentials';
import classNames from 'classnames';
import i18next from 'i18next';
import { useContext } from 'react';
import { Helmet } from 'react-helmet';

import PageContext from '@/Providers/PageContextProvider/PageContext';
import defaultAppleTouchLogo from '@/assets/apple-touch-icon.png';
import defaultFavicon from '@/assets/favicon.png';

import * as styles from './index.module.scss';

/**
 * User React Helmet to manage html and body attributes
 * @see https://github.com/nfl/react-helmet
 *
 * - lang: set html lang attribute
 * - data-theme: set html data-theme attribute
 * - favicon: set favicon
 * - apple-touch-icon: set apple touch icon
 * - body class: set preview body class
 * - body class: set platform body class
 * - body class: set theme body class
 * - custom css: set custom css style tag
 */

const AppMeta = () => {
  const { experienceSettings, theme, platform, isPreview } = useContext(PageContext);

  return (
    <Helmet>
      <html lang={i18next.language} data-theme={theme} />
      <link rel="shortcut icon" href={experienceSettings?.branding.favicon ?? defaultFavicon} />
      <link
        rel="apple-touch-icon"
        href={experienceSettings?.branding.favicon ?? defaultAppleTouchLogo}
        sizes="180x180"
      />
      {experienceSettings?.customCss && <style>{experienceSettings.customCss}</style>}
      <body
        className={classNames(
          conditionalString(isPreview && styles.preview),
          platform === 'mobile' ? 'mobile' : 'desktop',
          conditionalString(styles[theme])
        )}
      />
    </Helmet>
  );
};

export default AppMeta;
