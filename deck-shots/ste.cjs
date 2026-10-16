const fs = require('fs');
const f = 'build-deck-v2.cjs';
let src = fs.readFileSync(f, 'utf8');
const pairs = [
  ['Who signs in, how they prove it, and what the platform records', 'Who signs in. How they prove identity. What the platform records.'],
  ['What changes once the platform is in place', 'The results after the platform is set up.'],
  ['Enforce MFA, block high-risk sign-up domains, and federate staff through the bank\\u2019s own identity provider.', 'Set MFA. Block high-risk sign-up domains. Use the bank\\u2019s identity provider for staff.'],
  ['Every token issued and every admin change is in an audit log the bank can export and review.', 'Every token and admin change is recorded. The bank can export and review the records.'],
  ['Stacks deploy from approved templates, and the platform shows health, capacity and cost in one place.', 'Stacks deploy from approved templates. Health, capacity, and cost are shown in one place.'],
  ['Multi-factor authentication is set per tenant, not per app', 'MFA is set once for each tenant.'],
  ['Set when MFA is required: optional, or enforced for sign-in.', 'Set when MFA is required: optional or enforced.'],
  ['Choose the factors the bank accepts, such as one-time passcodes and backup codes.', 'Select the factors the bank accepts, for example one-time codes.'],
  ['Backup codes give staff a recovery path that does not weaken the policy.', 'Backup codes give a recovery path. The policy stays strong.'],
  ['Block high-risk email domains at registration', 'Block high-risk email domains at sign-up.'],
  ['Reject disposable domains and subaddresses such as name+alias@domain.', 'Reject disposable domains and subaddresses. Example: name+alias@domain.'],
  ['Allowlist only the partner domains the bank approves.', 'Allow only the partner domains the bank approves.'],
  ['Rules apply to new sign-ups and to newly linked emails.', 'Rules apply to new sign-ups and new linked emails.'],
  ['Use the bank\\u2019s own identity provider', 'Use the bank\\u2019s identity provider.'],
  ['Enterprise SSO connects SAML and OIDC identity providers', 'Enterprise SSO connects to SAML and OIDC providers.'],
  ['Staff sign in with the identity provider the bank already runs.', 'Staff sign in with their current identity provider.'],
  ['Each connector is tied to an email domain, so routing is automatic.', 'Each connector is linked to an email domain. Routing is automatic.'],
  ['A record of every sign-in event', 'A record of each sign-in event.'],
  ['The audit log shows each token issued, by application and by time', 'The audit log shows each token, by application and time.'],
  ['Filter by event, application and time window.', 'Filter by event, application, and time.'],
  ['Each row is a token exchange that the bank can trace to an application.', 'Each row is a token exchange. The bank can trace it to an application.'],
  ['Only approved deployments run', 'Only approved deployments run.'],
  ['Stacks show phase and component readiness for each environment', 'Stacks show phase and component status for each environment.'],
  ['Every stack is created from an approved template: Full, Lite or Dashboard AI only.', 'Each stack uses an approved template: Full, Lite, or Dashboard AI only.'],
  ['Component readiness, such as 22/22, shows whether a deployment is complete.', 'Component status, such as 22/22, shows if a deployment is complete.'],
  ['New environments start from the same templates, so there is one path to production.', 'New environments use the same templates. There is one path to production.'],
  ['A pilot that proves the controls before wider rollout', 'A pilot proves the controls before wider rollout.'],
  ['Connect one staff application to the bank identity provider with MFA enforced.', 'Connect one staff application to the bank identity provider. Enforce MFA.'],
  ['Agree the log format and retention with the bank\\u2019s audit team.', 'Agree the log format and retention with the audit team.'],
  ['Move the next environment onto approved templates once the pilot passes review.', 'Move the next environment to approved templates after the pilot passes review.'],
];
const missing = [];
for (const [from, to] of pairs) {
  if (src.includes(from)) src = src.split(from).join(to); else missing.push(from.slice(0, 50));
}
fs.writeFileSync(f, src);
console.log('replaced', pairs.length - missing.length, 'of', pairs.length, missing.length ? 'missing: ' + missing.join(' | ') : '');
