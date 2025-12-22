const signing_keys = {
  title: 'Signing keys',
  description: 'Securely manage signing keys used by your applications.',
  private_key: 'OIDC private keys',
  private_keys_description: 'OIDC private keys are used for signing JWT tokens.',
  cookie_key: 'OIDC cookie keys',
  cookie_keys_description: 'OIDC cookie keys are used for signing cookies.',
  private_keys_in_use: 'Private keys in use',
  cookie_keys_in_use: 'Cookie keys in use',
  rotate_private_keys: 'Rotate private keys',
  rotate_cookie_keys: 'Rotate cookie keys',
  rotate_private_keys_description:
    'This action will create a new private signing key, rotate the current key, and remove your previous key. Your JWT tokens signed with the current key will remain valid until deletion or another round of rotation.',
  rotate_cookie_keys_description:
    'This action will create a new cookie key, rotate the current key, and remove your previous key. Your cookies with the current key will remain valid until deletion or another round of rotation.',
  select_private_key_algorithm: 'Select signing key algorithm for the new private key',
  rotate_button: 'Rotate',
  table_column: {
    id: 'ID',
    status: 'Status',
    algorithm: 'Signing key algorithm',
  },
  status: {
    current: 'Current',
    previous: 'Previous',
  },
  reminder: {
    rotate_private_key:
      'Are you sure you want to rotate the <strong>OIDC private keys</strong>? New issued JWT tokens will be signed by the new key. Existing JWT tokens stay valid until you rotate again.',
    rotate_cookie_key:
      'Are you sure you want to rotate the <strong>OIDC cookie keys</strong>? New cookies generated in sign-in sessions will be signed by the new cookie key. Existing cookies stay valid until you rotate again.',
    delete_private_key:
      'Are you sure you want to delete the <strong>OIDC private key</strong>? Existing JWT tokens signed with this private signing key will no longer be valid.',
    delete_cookie_key:
      'Are you sure you want to delete the <strong>OIDC cookie key</strong>? Older sign-in sessions with cookies signed with this cookie key will no longer be valid. A re-authentication is required for these users.',
  },
  messages: {
    rotate_key_success: 'Signing keys rotated successfully.',
    delete_key_success: 'Key deleted successfully.',
  },
};

export default Object.freeze(signing_keys);
