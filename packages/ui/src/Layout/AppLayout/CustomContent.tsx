import { useLocation } from 'react-router-dom';

import { useSignInExperience } from '@/hooks/use-sie';

type Props = {
  className?: string;
};

const CustomContent = ({ className }: Props) => {
  const signInExperience = useSignInExperience();
  const { pathname } = useLocation();

  const customHtml = signInExperience?.customContent[pathname];

  if (!customHtml) {
    return null;
  }

  try {
    // Expected error; CustomContent content is load from Logto remote server
    // eslint-disable-next-line react/no-danger
    return <div dangerouslySetInnerHTML={{ __html: customHtml }} className={className} />;
  } catch {
    return null;
  }
};

export default CustomContent;
