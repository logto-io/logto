import { CaptchaType, type SignInExperience } from '@logto/schemas';
import { Trans } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { z } from 'zod';

import { FormCardSkeleton } from '@/components/FormCard';
import { recaptchaEnterpriseBringYourUi, turnstileBringYourUi } from '@/consts/external-links';
import InlineNotification from '@/ds-components/InlineNotification';
import TextLink from '@/ds-components/TextLink';
import { type RequestError } from '@/hooks/use-api';
import useDocumentationUrl from '@/hooks/use-documentation-url';

import PaywallNotification from '../PaywallNotification';

import CaptchaForm from './CaptchaForm';
import Guide from './Guide';
import styles from './index.module.scss';
import useDataFetch from './use-data-fetch';

function Captcha() {
  const { data, isLoading: isDataLoading } = useDataFetch();
  const { data: signInExpData, isLoading: isSignInExpLoading } = useSWR<
    SignInExperience,
    RequestError
  >('api/sign-in-exp');
  const isLoading = isDataLoading || isSignInExpLoading;
  const { getDocumentationUrl } = useDocumentationUrl();

  const { guideId } = useParams();
  const guideType = z.nativeEnum(CaptchaType).safeParse(guideId);
  const navigate = useNavigate();
  const shouldShowCustomUiCaptchaNotice = Boolean(signInExpData?.customUiAssets);
  const customUiCaptchaGuideLink =
    data?.config.type === CaptchaType.Turnstile
      ? turnstileBringYourUi
      : recaptchaEnterpriseBringYourUi;

  if (guideType.success) {
    return (
      <Guide
        type={guideType.data}
        onClose={() => {
          navigate(-1);
        }}
      />
    );
  }

  return (
    <div className={styles.content}>
      <PaywallNotification className={styles.upsellNotice} />
      {shouldShowCustomUiCaptchaNotice && (
        <InlineNotification className={styles.customUiNotice} severity="alert">
          <Trans
            i18nKey="admin_console.security.bot_protection.custom_ui_captcha_notice"
            components={{
              a: (
                <TextLink
                  href={getDocumentationUrl(customUiCaptchaGuideLink)}
                  targetBlank="noopener"
                />
              ),
              code: <code />,
            }}
          />
        </InlineNotification>
      )}
      {isLoading || !signInExpData ? (
        <FormCardSkeleton formFieldCount={2} />
      ) : (
        <CaptchaForm captchaProvider={data} formData={signInExpData.captchaPolicy} />
      )}
    </div>
  );
}

export default Captcha;
