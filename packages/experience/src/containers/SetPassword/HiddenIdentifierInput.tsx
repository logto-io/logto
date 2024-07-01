import useSessionStorage, { StorageKeys } from '@/hooks/use-session-storages';

/**
 * This component renders a hidden input field that stores the user's identifier.
 * Its primary purpose is to assist password managers in associating the correct
 * identifier with the password being set or changed.
 *
 * By including this hidden field, we enable password managers to correctly save
 * or update the user's credentials, enhancing the user experience and security.
 */
const HiddenIdentifierInput = () => {
  const { get } = useSessionStorage();
  const identifierSession = get(StorageKeys.CurrentIdentifier);

  if (!identifierSession) {
    return null;
  }

  return <input readOnly hidden type={identifierSession.type} value={identifierSession.value} />;
};

export default HiddenIdentifierInput;
