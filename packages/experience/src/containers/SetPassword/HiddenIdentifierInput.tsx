import { useContext } from 'react';

import UserInteractionContext from '@/Providers/UserInteractionContextProvider/UserInteractionContext';

import styles from './index.module.scss';

type Props = {
  /**
   * Whether the password is being set in a reset password flow.
   *
   * Note: since a user may not use the same identifier to sign in and reset password, the two
   * identifiers are cached separately, the same way `usePrefilledIdentifier` distinguishes them.
   */
  readonly isForgotPassword?: boolean;
};

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
const HiddenIdentifierInput = ({ isForgotPassword = false }: Props) => {
  const { identifierInputValue, forgotPasswordIdentifierInputValue } =
    useContext(UserInteractionContext);

  const identifier = isForgotPassword ? forgotPasswordIdentifierInputValue : identifierInputValue;

  if (!identifier) {
    return null;
  }

  return (
    <input
      readOnly
      aria-hidden
      className={styles.hiddenIdentifierInput}
      tabIndex={-1}
      name="username"
      autoComplete="username"
      type="text"
      value={identifier.value}
    />
  );
};

export default HiddenIdentifierInput;
