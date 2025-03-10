const one_time_token = {
  token_not_found: 'Active token not found with given email and token.',
  email_mismatch: 'Email mismatch with given token.',
  token_expired: 'The token is expired.',
  token_consumed: 'The token has been consumed.',
  token_revoked: 'The token has been revoked.',
  cannot_reactivate_token: 'Cannot reactivate the token.',
};

export default Object.freeze(one_time_token);
