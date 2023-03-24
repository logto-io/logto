import { SignInIdentifier } from '@logto/schemas';
import type { TFuncKey } from 'react-i18next';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';

import useSetUsername from './use-set-username';
import IdentifierProfileForm from '../IdentifierProfileForm';

type Props = {
  notification?: TFuncKey;
};

const SetUsername = (props: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSetUsername();

  const handleSubmit = async (identifier: SignInIdentifier, value: string) => {
    if (identifier !== SignInIdentifier.Username) {
      return;
    }

    return onSubmit(value);
  };

  return (
    <SecondaryPageLayout
      title="description.enter_username"
      description="description.enter_username_description"
      {...props}
    >
      <IdentifierProfileForm
        autoFocus
        errorMessage={errorMessage}
        clearErrorMessage={clearErrorMessage}
        defaultType={SignInIdentifier.Username}
        enabledTypes={[SignInIdentifier.Username]}
        onSubmit={handleSubmit}
      />
    </SecondaryPageLayout>
  );
};

export default SetUsername;
