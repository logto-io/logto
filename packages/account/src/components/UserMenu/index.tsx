import FlipOnRtl from '@experience/shared/components/FlipOnRtl';
import { onKeyDownHandler } from '@experience/shared/utils/a11y';
import { useLogto } from '@logto/react';
import { formatToInternationalPhoneNumber, getUserDisplayName } from '@logto/shared/universal';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import SignOutIcon from '@ac/assets/icons/sign-out.svg?react';
import { layoutClassNames } from '@ac/constants/layout';
import { accountCenterBasePath } from '@ac/utils/account-center-route';

import styles from './index.module.scss';

const postSignOutRedirectUri = `${window.location.origin}${accountCenterBasePath}`;

type AvatarProps = {
  readonly className?: string;
  readonly avatar?: string;
  readonly initial?: string;
};

const Avatar = ({ className, avatar, initial }: AvatarProps) =>
  avatar ? (
    <img className={className} src={avatar} alt="avatar" referrerPolicy="no-referrer" />
  ) : (
    <span className={classNames(className, styles.avatarFallback)}>{initial}</span>
  );

const UserMenu = () => {
  const { t } = useTranslation();
  const { signOut } = useLogto();
  const { userInfo } = useContext(PageContext);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  /** Closes the menu and returns focus to the avatar trigger, for keyboard dismissal. */
  const closeAndRestoreFocus = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (event.target instanceof Node && containerRef.current?.contains(event.target)) {
        return;
      }

      close();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeAndRestoreFocus();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [close, closeAndRestoreFocus, isOpen]);

  const handleSignOut = useCallback(() => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);
    void signOut(postSignOutRedirectUri);
  }, [isSigningOut, signOut]);

  if (!userInfo) {
    return null;
  }

  const { avatar, name, username, primaryEmail, primaryPhone } = userInfo;
  const avatarUrl = avatar ?? undefined;
  const displayName = getUserDisplayName({ name, username, primaryEmail, primaryPhone });
  const initial = displayName?.charAt(0).toLocaleUpperCase();
  // `primaryPhone` is stored as normalized digits, so format it the same way `getUserDisplayName`
  // does. Otherwise a phone-only user sees the formatted number as the name and the raw digits
  // right below it.
  const formattedPhone = primaryPhone && formatToInternationalPhoneNumber(primaryPhone);
  const secondaryText = primaryEmail ?? formattedPhone ?? username ?? undefined;

  return (
    <div ref={containerRef} className={classNames(styles.container, layoutClassNames.userMenu)}>
      <div
        ref={triggerRef}
        role="button"
        tabIndex={0}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={t('account_center.page.user_menu')}
        className={classNames(
          styles.avatarButton,
          isOpen && styles.active,
          layoutClassNames.userMenuAvatar
        )}
        onKeyDown={onKeyDownHandler(() => {
          setIsOpen((value) => !value);
        })}
        onClick={() => {
          setIsOpen((value) => !value);
        }}
      >
        <Avatar className={styles.avatar} avatar={avatarUrl} initial={initial} />
      </div>
      {isOpen && (
        <div role="menu" className={classNames(styles.dropdown, layoutClassNames.userMenuDropdown)}>
          <div role="group" className={styles.userInfo}>
            <Avatar className={styles.userInfoAvatar} avatar={avatarUrl} initial={initial} />
            <div className={styles.userInfoText}>
              {displayName && <div className={styles.name}>{displayName}</div>}
              {secondaryText !== displayName && secondaryText && (
                <div className={styles.secondary}>{secondaryText}</div>
              )}
            </div>
          </div>
          <div role="separator" className={styles.divider} />
          <div
            role="menuitem"
            tabIndex={0}
            aria-disabled={isSigningOut}
            className={classNames(styles.item, isSigningOut && styles.disabled)}
            onKeyDown={onKeyDownHandler(handleSignOut)}
            onClick={handleSignOut}
          >
            <FlipOnRtl>
              <SignOutIcon className={styles.itemIcon} />
            </FlipOnRtl>
            <span>{t('account_center.page.sign_out')}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
