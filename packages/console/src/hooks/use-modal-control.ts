import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

const useModalControl = (modalName: string) => {
  const modalSearchParametersKey = `m_${modalName}`;
  const [searchParameters, setSearchParameters] = useSearchParams();

  const open = useCallback(
    (data?: string) => {
      searchParameters.append(modalSearchParametersKey, data ?? 'true');
      setSearchParameters(searchParameters);
    },
    [modalSearchParametersKey, searchParameters, setSearchParameters]
  );

  const getOpenData = useCallback(
    () => searchParameters.get(modalSearchParametersKey) ?? undefined,
    [modalSearchParametersKey, searchParameters]
  );

  return {
    open,
    getOpenData,
    isOpen: Boolean(getOpenData()),
  };
};

export default useModalControl;
