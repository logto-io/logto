import { CaptchaType, type SignInExperience } from '@logto/schemas';
import { useNavigate, useParams } from 'react-router-dom';
import useSWR from 'swr';
import { z } from 'zod';

import { FormCardSkeleton } from '@/components/FormCard';
import { type RequestError } from '@/hooks/use-api';

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

  const { guideId } = useParams();
  const guideType = z.nativeEnum(CaptchaType).safeParse(guideId);
  const navigate = useNavigate();

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
      {isLoading || !signInExpData ? (
        <FormCardSkeleton formFieldCount={2} />
      ) : (
        <CaptchaForm captchaProvider={data} formData={signInExpData.captchaPolicy} />
      )}
    </div>
  );
}

export default Captcha;
