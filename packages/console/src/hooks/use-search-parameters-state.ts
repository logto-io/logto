import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const useSearchParametersState = (): [
  URLSearchParams,
  Dispatch<SetStateAction<URLSearchParams>>
] => {
  const [locationSearchParameters, setLocationSearchParameters] = useSearchParams();

  const [searchParametersState, setSearchParametersState] = useState(locationSearchParameters);

  useEffect(() => {
    setLocationSearchParameters(searchParametersState);
  }, [searchParametersState, setLocationSearchParameters]);

  return [searchParametersState, setSearchParametersState];
};

export default useSearchParametersState;
