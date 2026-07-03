const one_time_token = {
  token_not_found: 'Token {{token}} not found.',
  email_mismatch: 'Email mismatch with given token.',
  token_expired: 'The token is expired.',
  token_consumed: 'The token has been consumed.',
  token_revoked: 'The token has been revoked.',
  cannot_reactivate_token: 'Cannot reactivate the token.',
  interaction_event_mismatch: 'The token cannot be used for this interaction.',
};

export default Object.freeze(one_time_token);
