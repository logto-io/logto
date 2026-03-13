import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';

const PasswordIdentifierInput = () => {
  const { userInfo } = useContext(PageContext);
  const identifier = userInfo?.username ?? userInfo?.primaryEmail ?? userInfo?.primaryPhone;

  if (!identifier) {
    return null;
  }

  return (
    <input
      readOnly
      hidden
      id="username"
      name="username"
      type="text"
      autoComplete="username"
      value={identifier}
    />
  );
};

export default PasswordIdentifierInput;
