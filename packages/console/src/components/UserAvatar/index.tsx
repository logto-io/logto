import type { User } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';

import DefaultAvatar from '@/assets/images/default-avatar.svg';

import ImageWithErrorFallback from '../ImageWithErrorFallback';

import * as styles from './index.module.scss';

type Props = {
  className?: string;
  size?: 'micro' | 'small' | 'medium' | 'large' | 'xlarge';
  user?: Partial<Pick<User, 'name' | 'username' | 'avatar' | 'primaryEmail'>>;
};

function UserAvatar({ className, size = 'medium', user }: Props) {
  const avatarClassName = classNames(styles.avatar, styles[size]);
  const wrapperClassName = classNames(styles.wrapper, styles[size], className);
  const defaultColorPalette = [
    '#E74C3C',
    '#865300',
    '#FF8B64',
    '#FFC651',
    '#4EA254',
    '#2FA0FD',
    '#02C2E4',
    '#41BEA6',
    '#7958FF',
    '#ED73A3',
    '#DF96FA',
    '#ADAAB4',
  ];

  const { name, username, avatar, primaryEmail } = user ?? {};

  if (avatar) {
    return (
      <div className={wrapperClassName}>
        <ImageWithErrorFallback
          className={avatarClassName}
          src={avatar}
          alt="avatar"
          /**
           * Some social connectors like Google will block the references to its image resource,
           * without specifying the referrerPolicy attribute. Reference:
           * https://stackoverflow.com/questions/40570117/http403-forbidden-error-when-trying-to-load-img-src-with-google-profile-pic
           */
          referrerPolicy="no-referrer"
          fallbackElement={<DefaultAvatar />}
        />
      </div>
    );
  }

  const nameToDisplay = (name ?? username ?? primaryEmail)?.toLocaleUpperCase();

  const color = conditional(
    nameToDisplay &&
      defaultColorPalette[(nameToDisplay.codePointAt(0) ?? 0) % defaultColorPalette.length]
  );

  return (
    <div className={wrapperClassName}>
      <div className={avatarClassName} style={{ backgroundColor: color }}>
        {nameToDisplay ? nameToDisplay.charAt(0) : <DefaultAvatar />}
      </div>
    </div>
  );
}

export default UserAvatar;
