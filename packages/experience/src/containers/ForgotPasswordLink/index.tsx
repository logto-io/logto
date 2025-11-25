import type { SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';
import TextLink from '@/components/TextLink';
import useNavigateWithPreservedSearchParams from '@/hooks/use-navigate-with-preserved-search-params';
import { UserFlow } from '@/types';

type Props = {
  readonly identifier?: SignInIdentifier;
  readonly value?: string;
  readonly className?: string;
};

const ForgotPasswordLink = ({ className, ...identifierData }: Props) => {
  const navigate = useNavigateWithPreservedSearchParams();
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
