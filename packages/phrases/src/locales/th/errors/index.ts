import account_center from './account-center.js';
import application from './application.js';
import auth from './auth.js';
import connector from './connector.js';
import custom_profile_fields from './custom-profile-fields.js';
import domain from './domain.js';
import entity from './entity.js';
import guard from './guard.js';
import hook from './hook.js';
import jwt_customizer from './jwt-customizer.js';
import localization from './localization.js';
import log from './log.js';
import oidc from './oidc.js';
import one_time_token from './one-time-token.js';
import organization from './organization.js';
import password from './password.js';
import request from './request.js';
import resource from './resource.js';
import role from './role.js';
import scope from './scope.js';
import secrets from './secrets.js';
import session from './session.js';
import sign_in_experiences from './sign-in-experiences.js';
import single_sign_on from './single-sign-on.js';
import storage from './storage.js';
import subscription from './subscription.js';
import swagger from './swagger.js';
import user from './user.js';
import verification_code from './verification-code.js';
import verification_record from './verification-record.js';

const errors = {
  request,
  auth,
  guard,
  oidc,
  user,
  password,
  session,
  connector,
  verification_code,
  sign_in_experiences,
  jwt_customizer,
  localization,
  swagger,
  entity,
  log,
  role,
  scope,
  storage,
  resource,
  hook,
  domain,
  subscription,
  application,
  organization,
  single_sign_on,
  verification_record,
  account_center,
  one_time_token,
  custom_profile_fields,
  secrets,
};

export default Object.freeze(errors);
