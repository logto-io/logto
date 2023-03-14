import type { Nullable } from '@silverhand/essentials';
import classNames from 'classnames';
import { useContext } from 'react';

import DarkAvatar from '@/assets/images/default-avatar-dark.svg';
import LightAvatar from '@/assets/images/default-avatar-light.svg';
import { AppThemeContext } from '@/contexts/AppThemeProvider';
import { Theme } from '@/types/theme';

import ImageWithErrorFallback from '../ImageWithErrorFallback';
import * as styles from './index.module.scss';

type Props = {
  className?: string;
  url?: Nullable<string>;
  size?: 'small' | 'medium' | 'large';
};

const UserAvatar = ({ className, url, size = 'medium' }: Props) => {
  const { theme } = useContext(AppThemeContext);
  const DefaultAvatar = theme === Theme.LightMode ? LightAvatar : DarkAvatar;
  const avatarClassName = classNames(styles.avatar, styles[size], className);

  if (url) {
    return (
      <ImageWithErrorFallback
        className={avatarClassName}
        src={url}
        alt="avatar"
        /**
         * Some social connectors like Google will block the references to its image resource,
         * without specifying the referrerPolicy attribute. Reference:
         * https://stackoverflow.com/questions/40570117/http403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic
         */
        referrerPolicy="no-referrer"
      />
    );
  }

  return <DefaultAvatar className={avatarClassName} />;
};

export default UserAvatar;
