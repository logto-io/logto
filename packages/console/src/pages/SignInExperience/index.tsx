import type { AccountCenter, SignInExperience as SignInExperienceType } from '@logto/schemas';
import { useMemo, type ReactNode } from 'react';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import { authFlows } from '@/consts';
import { isCloud } from '@/consts/env';
import CardTitle from '@/ds-components/CardTitle';
import type { RequestError } from '@/hooks/use-api';
import useConfigs from '@/hooks/use-configs';
import useUiLanguages from '@/hooks/use-ui-languages';
import useUserAssetsService from '@/hooks/use-user-assets-service';

import PageContent from './PageContent';
import Skeleton from './Skeleton';
import Welcome from './Welcome';
import SignInExperienceContextProvider from './contexts/SignInExperienceContextProvider';
import styles from './index.module.scss';

type PageWrapperProps = {
  readonly children: ReactNode;
};

function PageWrapper({ children }: PageWrapperProps) {
  return (
    <SignInExperienceContextProvider>
      <div className={styles.container}>
        <CardTitle
          className={styles.cardTitle}
          title="sign_in_exp.title"
          subtitle="sign_in_exp.description"
          learnMoreLink={{ href: authFlows }}
        />
        {children}
      </div>
    </SignInExperienceContextProvider>
  );
}

function SignInExperience() {
  const {
    data: signInExperienceData,
    error: signInExperienceError,
    isLoading: isLoadingSignInExperience,
    mutate: mutateSignInExperience,
  } = useSWR<SignInExperienceType, RequestError>('api/sign-in-exp');

  const {
    data: accountCenter,
    error: accountCenterError,
    isLoading: isLoadingAccountCenter,
    mutate: mutateAccountCenter,
  } = useSWR<AccountCenter, RequestError>('api/account-center');

  const { isLoading: isUserAssetsServiceLoading } = useUserAssetsService();

  const {
    configs,
    error: configsError,
    isLoading: isLoadingConfig,
    mutate: mutateConfigs,
  } = useConfigs();

  const shouldDisplayWelcome = !isCloud && !configs?.signInExperienceCustomized;

  const { error: languageError, isLoading: isLoadingLanguages } = useUiLanguages();

  const requestError = signInExperienceError ?? configsError ?? languageError ?? accountCenterError;

  const isLoading =
    isLoadingSignInExperience ||
    isLoadingConfig ||
    isLoadingLanguages ||
    isLoadingAccountCenter ||
    isUserAssetsServiceLoading;

  const data = useMemo(() => {
    if (!signInExperienceData || !accountCenter) {
      return;
    }

    return {
      ...signInExperienceData,
      accountCenter,
    };
  }, [accountCenter, signInExperienceData]);

  if (isLoading) {
    return <Skeleton />;
  }

  if (requestError) {
    return (
      <PageWrapper>
        <RequestDataError
          className={styles.error}
          error={requestError}
          onRetry={() => {
            void mutateConfigs();
            void mutateSignInExperience();
            void mutateAccountCenter();
          }}
        />
      </PageWrapper>
    );
  }

  if (shouldDisplayWelcome) {
    return (
      <PageWrapper>
        <Welcome
          mutate={() => {
            void mutateConfigs();
            void mutateSignInExperience();
            void mutateAccountCenter();
          }}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {data && (
        <PageContent
          data={data}
          onSignInExperienceUpdated={mutateSignInExperience}
          onAccountCenterUpdated={mutateAccountCenter}
        />
      )}
    </PageWrapper>
  );
}

export default SignInExperience;
