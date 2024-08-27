import type { SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import TextLink from '@/components/TextLink';
import { UserFlow } from '@/types';

type Props = {
  readonly identifier?: SignInIdentifier;
  readonly value?: string;
  readonly className?: string;
};

const ForgotPasswordLink = ({ className, ...identifierData }: Props) => {
  const navigate = useNavigate();
  const { setForgotPasswordIdentifierInputValue } = useContext(UserInteractionContext);

  return (
    <TextLink
      className={className}
      text="action.forgot_password"
      onClick={() => {
        setForgotPasswordIdentifierInputValue({
          type: identifierData.identifier,
          value: identifierData.value ?? '',
        });

        navigate(`/${UserFlow.ForgotPassword}`);
      }}
    />
  );
};

export default ForgotPasswordLink;
