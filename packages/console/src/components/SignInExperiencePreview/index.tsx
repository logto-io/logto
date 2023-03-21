import type { LanguageTag } from '@logto/language-kit';
import type { ConnectorMetadata, ConnectorResponse, SignInExperience } from '@logto/schemas';
import { Theme, ConnectorType } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import { format } from 'date-fns';
import { useContext, useRef, useMemo, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import PhoneInfo from '@/assets/images/phone-info.svg';
import { AppEndpointsContext } from '@/contexts/AppEndpointsProvider';
import type { RequestError } from '@/hooks/use-api';
import useUiLanguages from '@/hooks/use-ui-languages';

import * as styles from './index.module.scss';
import { PreviewPlatform } from './types';

export { default as ToggleUiThemeButton } from './components/ToggleUiThemeButton';

type Props = {
  platform: PreviewPlatform;
  mode: Theme;
  language?: LanguageTag;
  signInExperience?: SignInExperience;
};

function SignInExperiencePreview({ platform, mode, language = 'en', signInExperience }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { customPhrases } = useUiLanguages();
  const { userEndpoint } = useContext(AppEndpointsContext);
  const previewRef = useRef<HTMLIFrameElement>(null);
  const { data: allConnectors } = useSWR<ConnectorResponse[], RequestError>('api/connectors');
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const configForUiPage = useMemo(() => {
    if (!allConnectors || !signInExperience) {
      return;
    }

    const socialConnectors = signInExperience.socialSignInConnectorTargets.reduce<
      Array<ConnectorMetadata & { id: string }>
    >(
      (previous, connectorTarget) => [
        ...previous,
        ...allConnectors.filter(({ target }) => target === connectorTarget),
      ],
      []
    );

    const hasEmailConnector = allConnectors.some(({ type }) => type === ConnectorType.Email);

    const hasSmsConnector = allConnectors.some(({ type }) => type === ConnectorType.Sms);

    return {
      signInExperience: {
        ...signInExperience,
        socialConnectors,
        forgotPassword: {
          email: hasEmailConnector,
          sms: hasSmsConnector,
        },
      },
      language,
      mode,
      platform: platform === PreviewPlatform.DesktopWeb ? 'web' : 'mobile',
      isNative: platform === PreviewPlatform.Mobile,
    };
  }, [allConnectors, language, mode, platform, signInExperience]);

  const postPreviewMessage = useCallback(() => {
    if (!configForUiPage || !customPhrases) {
      return;
    }

    previewRef.current?.contentWindow?.postMessage(
      { sender: 'ac_preview', config: configForUiPage },
      userEndpoint?.origin ?? ''
    );
  }, [userEndpoint?.origin, configForUiPage, customPhrases]);

  const iframeOnLoadEventHandler = useCallback(() => {
    setIframeLoaded(true);
  }, []);

  useEffect(() => {
    const iframe = previewRef.current;

    iframe?.addEventListener('load', iframeOnLoadEventHandler);

    return () => {
      iframe?.removeEventListener('load', iframeOnLoadEventHandler);
    };
  }, [iframeLoaded, iframeOnLoadEventHandler]);

  useEffect(() => {
    if (!iframeLoaded) {
      return;
    }

    postPreviewMessage();
  }, [iframeLoaded, postPreviewMessage]);

  if (!userEndpoint) {
    return null;
  }

  return (
    <div
      className={classNames(
        styles.preview,
        platform === PreviewPlatform.DesktopWeb ? styles.web : styles.mobile
      )}
      style={conditional(
        platform === PreviewPlatform.DesktopWeb && {
          // Set background color to match iframe's background color on both dark and light mode.
          backgroundColor: mode === Theme.Dark ? '#000' : '#e5e1ec',
        }
      )}
    >
      <div className={styles.deviceWrapper}>
        <div className={classNames(styles.device, styles[String(mode)])}>
          {platform !== PreviewPlatform.DesktopWeb && (
            <div className={styles.topBar}>
              <div className={styles.time}>{format(Date.now(), 'HH:mm')}</div>
              <PhoneInfo />
            </div>
          )}
          <iframe
            ref={previewRef}
            // Allow all sandbox rules
            sandbox={undefined}
            src={new URL('/sign-in?preview=true', userEndpoint).toString()}
            tabIndex={-1}
            title={t('sign_in_exp.preview.title')}
          />
        </div>
      </div>
    </div>
  );
}

export default SignInExperiencePreview;
