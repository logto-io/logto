import type { SignInExperience as SignInExperienceType } from '@logto/schemas';
import type { ReactNode } from 'react';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
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
          title="sign_in_exp.title"
          subtitle="sign_in_exp.description"
          className={styles.cardTitle}
        />
        {children}
      </div>
    </SignInExperienceContextProvider>
  );
}

function SignInExperience() {
  const {
    data,
    error,
    isLoading: isLoadingSignInExperience,
    mutate,
  } = useSWR<SignInExperienceType, RequestError>('api/sign-in-exp');

  const { isLoading: isUserAssetsServiceLoading } = useUserAssetsService();

  const {
    configs,
    error: configsError,
    isLoading: isLoadingConfig,
    mutate: mutateConfigs,
  } = useConfigs();

  const shouldDisplayWelcome = !isCloud && !configs?.signInExperienceCustomized;

  const { error: languageError, isLoading: isLoadingLanguages } = useUiLanguages();

  const requestError = error ?? configsError ?? languageError;

  const isLoading =
    isLoadingSignInExperience ||
    isLoadingConfig ||
    isLoadingLanguages ||
    isUserAssetsServiceLoading;

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
            void mutate();
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
            void mutate();
          }}
        />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {data && <PageContent data={data} onSignInExperienceUpdated={mutate} />}
    </PageWrapper>
  );
}

export default SignInExperience;
