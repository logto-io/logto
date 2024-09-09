import type { User } from '@logto/schemas';
import { getUserDisplayName, formatToInternationalPhoneNumber } from '@logto/shared/universal';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import DefaultAvatar from '@/assets/images/default-avatar.svg?react';
import ImageWithErrorFallback from '@/ds-components/ImageWithErrorFallback';
import { Tooltip } from '@/ds-components/Tip';

import styles from './index.module.scss';

type UserInfo = Pick<User, 'name' | 'username' | 'avatar' | 'primaryEmail' | 'primaryPhone'>;

type Props = {
  readonly className?: string;
  readonly size?: 'micro' | 'small' | 'medium' | 'large' | 'xlarge';
  readonly user?: Partial<UserInfo>;
  readonly hasTooltip?: boolean;
};

function UserInfoTipContent({ user }: { readonly user: Partial<UserInfo> }) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { name, primaryEmail, primaryPhone, username } = user;
  const itemsToDisplay = [
    { label: t('user_details.field_name'), value: name },
    { label: t('user_details.field_email'), value: primaryEmail },
    {
      label: t('user_details.field_phone'),
      value: conditional(primaryPhone && formatToInternationalPhoneNumber(primaryPhone)),
    },
    { label: t('user_details.field_username'), value: username },
  ];
  return (
    <>
      {itemsToDisplay
        .filter(({ value }) => Boolean(value))
        .map(({ label, value }) => (
          <div key={label} className={styles.row}>
            <span className={styles.label}>{label}:</span>
            <span className={styles.value}>{value}</span>
          </div>
        ))}
    </>
  );
}

function UserAvatar({ className, size = 'medium', user, hasTooltip = false }: Props) {
  const { i18n } = useTranslation();
  const avatarClassName = classNames(styles.avatar, styles[size], styles[i18n.dir()]);
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

  const nameToDisplay = getUserDisplayName({ name, username, primaryEmail })?.toLocaleUpperCase();

  const color = conditional(
    nameToDisplay &&
      defaultColorPalette[(nameToDisplay.codePointAt(0) ?? 0) % defaultColorPalette.length]
  );

  return (
    <div className={wrapperClassName}>
      <Tooltip
        className={styles.tooltip}
        anchorClassName={styles[size]}
        content={conditional(hasTooltip && user && <UserInfoTipContent user={user} />)}
      >
        <div className={avatarClassName} style={{ backgroundColor: color }}>
          {nameToDisplay ? nameToDisplay.charAt(0) : <DefaultAvatar />}
        </div>
      </Tooltip>
    </div>
  );
}

export default UserAvatar;
