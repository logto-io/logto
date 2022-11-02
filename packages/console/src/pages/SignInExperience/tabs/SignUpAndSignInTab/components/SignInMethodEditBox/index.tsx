import type { ConnectorType } from '@logto/schemas';
import { SignInIdentifier } from '@logto/schemas';
import { useCallback, useEffect, useRef } from 'react';

import DragDropProvider from '@/components/Transfer/DragDropProvider';
import DraggableItem from '@/components/Transfer/DraggableItem';

import { signInIdentifiers, signInIdentifierToRequiredConnectorMapping } from '../../constants';
import ConnectorSetupWarning from '../ConnectorSetupWarning';
import AddButton from './AddButton';
import SignInMethodItem from './SignInMethodItem';
import type { SignInMethod } from './types';
import {
  computeOnSignInMethodAppended,
  computeOnVerificationStateChanged,
  computeOnPasswordPrimaryFlagToggled,
  getSignInMethodPasswordCheckState,
  getSignInMethodVerificationCodeCheckState,
} from './utilities';

type Props = {
  value: SignInMethod[];
  onChange: (value: SignInMethod[]) => void;
  requiredSignInIdentifiers: SignInIdentifier[];
  isSignUpPasswordRequired: boolean;
  isSignUpVerificationRequired: boolean;
};

const SignInMethodEditBox = ({
  value,
  onChange,
  requiredSignInIdentifiers,
  isSignUpPasswordRequired,
  isSignUpVerificationRequired,
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
        computeOnSignInMethodAppended(value, {
          identifier,
          password: getSignInMethodPasswordCheckState(identifier, isSignUpPasswordRequired),
          verificationCode: getSignInMethodVerificationCodeCheckState(identifier),
          isPasswordPrimary: true,
        })
      );
    },
    [handleChange, value, isSignUpPasswordRequired]
  );

  useEffect(() => {
    const allSignInMethods = requiredSignInIdentifiers.reduce(
      (previous, current) =>
        computeOnSignInMethodAppended(previous, {
          identifier: current,
          password: getSignInMethodPasswordCheckState(current, isSignUpPasswordRequired),
          verificationCode: getSignInMethodVerificationCodeCheckState(current),
          isPasswordPrimary: true,
        }),
      signInMethods.current
    );

    handleChange(
      allSignInMethods.map((method) => ({
        ...method,
        password: getSignInMethodPasswordCheckState(
          method.identifier,
          isSignUpPasswordRequired,
          method.password
        ),
        verificationCode: getSignInMethodVerificationCodeCheckState(method.identifier),
      }))
    );
  }, [
    handleChange,
    isSignUpPasswordRequired,
    isSignUpVerificationRequired,
    requiredSignInIdentifiers,
  ]);

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
              isPasswordEnabled={
                signInMethod.identifier !== SignInIdentifier.Username && !isSignUpPasswordRequired
              }
              isVerificationEnabled={
                (isSignUpPasswordRequired && isSignUpVerificationRequired) ||
                // Note: the next line is used to handle the case when the sign-up identifier is `Username`
                (isSignUpPasswordRequired && signInMethod.identifier !== SignInIdentifier.Username)
              }
              isDeletable={!requiredSignInIdentifiers.includes(signInMethod.identifier)}
              onVerificationStateChange={(identifier, verification, checked) => {
                handleChange(
                  computeOnVerificationStateChanged(value, identifier, verification, checked)
                );
              }}
              onToggleVerificationPrimary={(identifier) => {
                handleChange(computeOnPasswordPrimaryFlagToggled(value, identifier));
              }}
              onDelete={(identifier) => {
                handleChange(value.filter((method) => method.identifier !== identifier));
              }}
            />
          </DraggableItem>
        ))}
      </DragDropProvider>
      <ConnectorSetupWarning
        requiredConnectors={value.reduce<ConnectorType[]>(
          (connectors, { identifier: signInIdentifier }) => {
            return [...connectors, ...signInIdentifierToRequiredConnectorMapping[signInIdentifier]];
          },
          []
        )}
      />
      <AddButton
        options={signInIdentifierOptions}
        hasSelectedIdentifiers={value.length > 0}
        onSelected={addSignInMethod}
      />
    </div>
  );
};

export default SignInMethodEditBox;
