import { MfaFactor } from '@logto/schemas';
import classNames from 'classnames';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import WebAuthnIcon from '@ac/assets/icons/factor-webauthn.svg?react';
import { layoutClassNames } from '@ac/constants/layout';
import { passkeyAddRoute, passkeyManageRoute } from '@ac/constants/routes';
import { getPendingReturn, setPendingReturn } from '@ac/utils/account-center-route';
import {
  getPasskeyFieldControl,
  hasVisiblePasskeySection,
  isEditableField,
} from '@ac/utils/security-page';

import { getMfaVerifications } from '../../../apis/mfa';
import useApi from '../../../hooks/use-api';

import PasskeySkeleton from './PasskeySkeleton';
import styles from './index.module.scss';

const PasskeySection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { accountCenterSettings, experienceSettings } = useContext(PageContext);
  const [passkeyCount, setPasskeyCount] = useState<number>();
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passkeyControl = getPasskeyFieldControl(
    accountCenterSettings?.fields.passkey,
    accountCenterSettings?.fields.mfa
  );
  const isEditable = isEditableField(passkeyControl);
  const isSectionVisible = hasVisiblePasskeySection(passkeyControl, experienceSettings);
  const isSectionLoading = isSectionVisible && (!hasLoaded || isLoading);

  const getMfaRequest = useApi(getMfaVerifications, { silent: true });

  const fetchPasskeys = useCallback(async () => {
    setIsLoading(true);
    const [error, result] = await getMfaRequest();
    if (!error && result) {
      setPasskeyCount(
        result.filter((verification) => verification.type === MfaFactor.WebAuthn).length
      );
    }
    setHasLoaded(true);
    setIsLoading(false);
  }, [getMfaRequest]);

  useEffect(() => {
    if (isSectionVisible) {
      void fetchPasskeys();
    }
  }, [isSectionVisible, fetchPasskeys]);

  const navigateTo = useCallback(
    (route: string) => {
      setPendingReturn(getPendingReturn() ?? window.location.href);
      navigate(route);
    },
    [navigate]
  );

  if (!isSectionVisible) {
    return null;
  }

  const isConfigured = (passkeyCount ?? 0) > 0;

  return (
    <div className={classNames(styles.section, layoutClassNames.section)}>
      <div className={classNames(styles.sectionTitle, layoutClassNames.sectionTitle)}>
        {t('account_center.security.passkeys')}
      </div>
      <div className={classNames(styles.card, layoutClassNames.card)}>
        {isSectionLoading ? (
          <div
            className={styles.skeletonContent}
            role="status"
            aria-live="polite"
            aria-busy="true"
            aria-label={t('account_center.security.passkeys')}
          >
            <PasskeySkeleton hasAction={isEditable} />
          </div>
        ) : (
          <div className={classNames(styles.row, layoutClassNames.row)}>
            <div className={styles.topLine}>
              <div className={styles.iconWrap}>
                <WebAuthnIcon className={styles.icon} />
              </div>
              {isEditable && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.actionButton}
                    onClick={() => {
                      navigateTo(isConfigured ? passkeyManageRoute : passkeyAddRoute);
                    }}
                  >
                    {isConfigured
                      ? t('account_center.security.manage')
                      : t('account_center.security.add')}
                  </button>
                </div>
              )}
            </div>
            <div className={styles.title}>{t('account_center.security.passkeys')}</div>
            <div className={styles.value}>
              {isConfigured ? (
                <span className={styles.statusTag}>
                  <span className={styles.statusDot} />
                  {t('account_center.security.passkeys_count', { count: passkeyCount ?? 0 })}
                </span>
              ) : (
                <span className={styles.notConfigured}>
                  {t('account_center.security.not_configured')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasskeySection;
