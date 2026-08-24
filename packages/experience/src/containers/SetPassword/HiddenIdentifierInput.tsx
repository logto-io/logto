import { SignInIdentifier } from '@logto/schemas';
import { useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';

import styles from './index.module.scss';

const identifierInputTypeMap = Object.freeze({
  [SignInIdentifier.Email]: 'email',
  [SignInIdentifier.Phone]: 'tel',
  [SignInIdentifier.Username]: 'text',
}) satisfies Record<SignInIdentifier, InputType>;

/**
 * This component renders a visually hidden input field that stores the user's identifier.
 * Its primary purpose is to assist password managers in associating the correct
 * identifier with the password being set or changed.
 *
 * By including this field, we enable password managers to correctly save
 * or update the user's credentials, enhancing the user experience and security.
 *
 * Note: the field is hidden with CSS instead of the HTML `hidden` attribute, since some
 * browsers (e.g. Safari) skip `hidden` fields when detecting the username context, which
 * prevents them from offering a strong password suggestion.
 */
const HiddenIdentifierInput = () => {
  const { identifierInputValue } = useContext(UserInteractionContext);

  if (!identifierInputValue) {
    return null;
  }

  const { type, value } = identifierInputValue;

  return (
    <input
      readOnly
      aria-hidden
      className={styles.hiddenIdentifierInput}
      tabIndex={-1}
      name="username"
      autoComplete="username"
      type={type ? identifierInputTypeMap[type] : 'text'}
      value={value}
    />
  );
};

export default HiddenIdentifierInput;
