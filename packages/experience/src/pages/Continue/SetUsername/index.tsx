import { SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';

import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import { type ContinueFlowInteractionEvent } from '@/types';

import IdentifierProfileForm from '../IdentifierProfileForm';

import useSetUsername from './use-set-username';

type Props = {
  readonly interactionEvent: ContinueFlowInteractionEvent;
};

const SetUsername = ({ interactionEvent }: Props) => {
  const { onSubmit, errorMessage, clearErrorMessage } = useSetUsername(interactionEvent);

  const { setIdentifierInputValue } = useContext(UserInteractionContext);

  const handleSubmit = async (identifier: SignInIdentifier, value: string) => {
    if (identifier !== SignInIdentifier.Username) {
      return;
    }

    setIdentifierInputValue({ type: identifier, value });

    return onSubmit(value);
  };

  return (
    <SecondaryPageLayout
      title="description.enter_username"
      description="description.enter_username_description"
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
