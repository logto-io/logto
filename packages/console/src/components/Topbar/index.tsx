import { isKeyInObject, trySafe } from '@silverhand/essentials';
import classNames from 'classnames';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import ContactIcon from '@/assets/icons/contact-us.svg';
import CubeIcon from '@/assets/icons/cube.svg';
import DocumentIcon from '@/assets/icons/document-nav-button.svg';
import CloudLogo from '@/assets/images/cloud-logo.svg';
import Logo from '@/assets/images/logo.svg';
import { githubReleasesLink } from '@/consts';
import { isCloud } from '@/consts/env';
import DynamicT from '@/ds-components/DynamicT';
import Spacer from '@/ds-components/Spacer';
import TextLink from '@/ds-components/TextLink';
import useDocumentationUrl from '@/hooks/use-documentation-url';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { onKeyDownHandler } from '@/utils/a11y';

import ContactModal from './ContactModal';
import TenantSelector from './TenantSelector';
import UserInfo from './UserInfo';
import * as styles from './index.module.scss';
import { currentVersion, isGreaterThanCurrentVersion } from './utils';

type Props = {
  readonly className?: string;
  /* eslint-disable react/boolean-prop-naming */
  readonly hideTenantSelector?: boolean;
  readonly hideTitle?: boolean;
  /* eslint-enable react/boolean-prop-naming */
};

function Topbar({ className, hideTenantSelector, hideTitle }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { navigate } = useTenantPathname();
  const LogtoLogo = isCloud ? CloudLogo : Logo;

  return (
    <div className={classNames(styles.topbar, className)}>
      <LogtoLogo
        className={styles.logo}
        onClick={() => {
          navigate('/');
        }}
      />
      {isCloud && !hideTenantSelector && <TenantSelector />}
      {!isCloud && !hideTitle && (
        <>
          <div className={styles.line} />
          <div className={styles.text}>{t('title')}</div>
        </>
      )}
      <Spacer />
      <DocumentButton />
      <HelpButton />
      {!isCloud && <VersionButton />}
      <UserInfo />
    </div>
  );
}

export default Topbar;

function DocumentButton() {
  const { documentationSiteUrl } = useDocumentationUrl();
  return (
    <TextLink
      href={documentationSiteUrl}
      targetBlank="noopener"
      className={styles.button}
      icon={<DocumentIcon className={styles.icon} />}
    >
      <DynamicT forKey="topbar.docs" />
    </TextLink>
  );
}

function HelpButton() {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div
        ref={anchorRef}
        tabIndex={0}
        className={styles.button}
        role="button"
        onKeyDown={onKeyDownHandler(() => {
          setIsContactOpen(true);
        })}
        onClick={() => {
          setIsContactOpen(true);
        }}
      >
        <ContactIcon className={styles.icon} />
        <span>
          <DynamicT forKey="topbar.help" />
        </span>
      </div>
      <ContactModal
        isOpen={isContactOpen}
        onCancel={() => {
          setIsContactOpen(false);
        }}
      />
    </>
  );
}

function VersionButton() {
  const [isNewVersionAvailable, setIsNewVersionAvailable] = useState(false);

  useEffect(() => {
    void trySafe(
      async () => {
        const response = await fetch('https://numbers.logto.io/pull.json');
        const json = await response.json();
        if (
          !isKeyInObject(json, 'latestRelease') ||
          typeof json.latestRelease !== 'string' ||
          !json.latestRelease.startsWith('v')
        ) {
          return;
        }
        if (isGreaterThanCurrentVersion(json.latestRelease)) {
          setIsNewVersionAvailable(true);
        }
      },
      (error) => {
        console.warn('Failed to check for new version', error);
      }
    );
  }, []);

  return (
    <TextLink
      href={githubReleasesLink}
      targetBlank="noopener"
      className={styles.button}
      icon={<CubeIcon className={styles.icon} />}
    >
      v{currentVersion}
      {isNewVersionAvailable && <div className={styles.newVersionDot} />}
    </TextLink>
  );
}
