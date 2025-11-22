import { AccountCenterControlValue } from '@logto/schemas';
import { useContext } from 'react';

import PageContext from '@ac/Providers/PageContextProvider/PageContext';
import ErrorPage from '@ac/components/ErrorPage';
import VerificationMethodList from '@ac/components/VerificationMethodList';

const Email = () => {
  const { accountCenterSettings, verificationId, userInfo } = useContext(PageContext);

  if (
    !accountCenterSettings?.enabled ||
    accountCenterSettings.fields.email !== AccountCenterControlValue.Edit
  ) {
    return (
      <ErrorPage titleKey="error.something_went_wrong" messageKey="error.feature_not_enabled" />
    );
  }

  if (!verificationId) {
    return <VerificationMethodList />;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Email Settings</h1>
      <p>Verification ID: {verificationId}</p>
      {userInfo?.primaryEmail && <p>Current Email: {userInfo.primaryEmail}</p>}
      <p>Email linking function is currently blank.</p>
    </div>
  );
};

export default Email;
