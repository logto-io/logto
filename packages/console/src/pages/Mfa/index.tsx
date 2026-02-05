import { type SignInExperience } from '@logto/schemas';
import useSWR from 'swr';

import RequestDataError from '@/components/RequestDataError';
import { type RequestError } from '@/hooks/use-api';

import MfaForm from './MfaForm';
import PageWrapper from './PageWrapper';
import Skeleton from './Skeleton';

function Mfa() {
  const { data, error, mutate, isLoading } = useSWR<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  if (isLoading) {
    return (
      <PageWrapper>
        <Skeleton />
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <RequestDataError error={error} onRetry={mutate} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      {data && (
        <MfaForm
          data={data.mfa}
          adaptiveMfa={data.adaptiveMfa}
          signInMethods={data.signIn.methods}
          onMfaUpdated={(mfa, adaptiveMfa) => {
            void mutate({ ...data, mfa, adaptiveMfa: adaptiveMfa ?? data.adaptiveMfa });
          }}
        />
      )}
    </PageWrapper>
  );
}

export default Mfa;
