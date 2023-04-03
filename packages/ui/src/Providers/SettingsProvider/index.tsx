import { useContext } from 'react';

import PageContext from '@/Providers/PageContextProvider/PageContext';

import PreviewProvider from '../PreviewProvider';
import SignInExperienceProvider from '../SignInExperienceProvider';

type Props = {
  children: React.ReactElement;
};

const SettingsProvider = ({ children }: Props) => {
  const { isPreview, experienceSettings } = useContext(PageContext);

  return (
    <>
      {isPreview ? <PreviewProvider /> : <SignInExperienceProvider />}
      {experienceSettings ? children : null}
    </>
  );
};

export default SettingsProvider;
