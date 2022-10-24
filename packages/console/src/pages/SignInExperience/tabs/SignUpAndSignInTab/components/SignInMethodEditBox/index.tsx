import type { SignInIdentifier } from '@logto/schemas';
import { useCallback, useEffect, useRef } from 'react';

import DragDropProvider from '@/components/Transfer/DragDropProvider';
import DraggableItem from '@/components/Transfer/DraggableItem';

import { signInIdentifiers } from '../../constants';
import ConnectorSetupWarning from '../ConnectorSetupWarning';
import AddSignInMethodButton from './AddSignInMethodButton';
import SignInMethodItem from './SignInMethodItem';
import type { SignInMethod } from './types';
import {
  appendSignInMethod as appendSignInMethodIfNotExist,
  mutateVerificationState,
  togglePasswordPrimaryFlag,
} from './utilities';

type Props = {
  value: SignInMethod[];
  onChange: (value: SignInMethod[]) => void;
  requiredSignInIdentifiers: SignInIdentifier[];
  isPasswordRequired: boolean;
  isVerificationRequired: boolean;
};

const SignInMethodEditBox = ({
  value,
  onChange,
  requiredSignInIdentifiers,
  isPasswordRequired,
  isVerificationRequired,
}: Props) => {
  const signInIdentifierOptions = signInIdentifiers.filter((candidateIdentifier) =>
    value.every(({ identifier }) => identifier !== candidateIdentifier)
  );

  // Note: add a reference to avoid infinite loop when change the value by `useEffect`
  const signInMethods = useRef(value);

  const handleChange = useCallback(
    (value: SignInMethod[]) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      signInMethods.current = value;
      onChange(value);
    },
    [onChange]
  );

  const addSignInMethod = useCallback(
    (identifier: SignInIdentifier) => {
      handleChange(
        appendSignInMethodIfNotExist(value, identifier, isPasswordRequired, isVerificationRequired)
      );
    },
    [handleChange, value, isPasswordRequired, isVerificationRequired]
  );

  useEffect(() => {
    const requiredSignInMethods = requiredSignInIdentifiers.reduce(
      (previous, current) =>
        appendSignInMethodIfNotExist(previous, current, isPasswordRequired, isVerificationRequired),
      signInMethods.current
    );

    handleChange(
      requiredSignInMethods.map((method) => ({
        ...method,
        password: isPasswordRequired,
        verificationCode: isVerificationRequired,
      }))
    );
  }, [handleChange, isPasswordRequired, isVerificationRequired, requiredSignInIdentifiers]);

  const onMoveItem = (dragIndex: number, hoverIndex: number) => {
    const dragItem = value[dragIndex];
    const hoverItem = value[hoverIndex];

    if (!dragItem || !hoverItem) {
      return;
    }

    handleChange(
      value.map((value_, index) => {
        if (index === dragIndex) {
          return hoverItem;
        }

        if (index === hoverIndex) {
          return dragItem;
        }

        return value_;
      })
    );
  };

  return (
    <div>
      <DragDropProvider>
        {value.map((signInMethod, index) => (
          <DraggableItem
            key={signInMethod.identifier}
            id={signInMethod.identifier}
            sortIndex={index}
            moveItem={onMoveItem}
          >
            <SignInMethodItem
              signInMethod={signInMethod}
              isPasswordRequired={isPasswordRequired}
              isVerificationRequired={isVerificationRequired}
              isDeletable={requiredSignInIdentifiers.includes(signInMethod.identifier)}
              onVerificationStateChange={(identifier, verification, checked) => {
                handleChange(mutateVerificationState(value, identifier, verification, checked));
              }}
              onToggleVerificationPrimary={(identifier) => {
                handleChange(togglePasswordPrimaryFlag(value, identifier));
              }}
              onDelete={(identifier) => {
                handleChange(value.filter((method) => method.identifier !== identifier));
              }}
            />
          </DraggableItem>
        ))}
      </DragDropProvider>
      {requiredSignInIdentifiers.length > 0 && (
        <ConnectorSetupWarning signInIdentifiers={requiredSignInIdentifiers} />
      )}
      <AddSignInMethodButton options={signInIdentifierOptions} onSelected={addSignInMethod} />
    </div>
  );
};

export default SignInMethodEditBox;
