import { ExtraParamsKey } from '@logto/schemas';
import { useSearchParams } from 'react-router-dom';

const useLoginHint = () => {
  const [searchParams] = useSearchParams();

  return searchParams.get(ExtraParamsKey.LoginHint) ?? undefined;
};

export default useLoginHint;
