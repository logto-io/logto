import { useContext, useMemo } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

import usePreview from './use-preview';
import useSignInExperience from './use-sign-in-experience';

type Props = {
  readonly children: React.ReactElement;
};

const SettingsProvider = ({ children }: Props) => {
  const { isPreview, experienceSettings } = useContext(PageContext);

  const usePageLoad = useMemo(() => (isPreview ? usePreview : useSignInExperience), [isPreview]);

  usePageLoad();

  return experienceSettings ? children : null;
};

export default SettingsProvider;
