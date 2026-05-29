export const disableAdminPwnedPasswordCheckDescription =
  "Seed the admin tenant's sign-in experience with the Have I Been Pwned (HIBP) " +
  'password breach check disabled. Use this for air-gapped or offline OSS deployments ' +
  'where api.pwnedpasswords.com is unreachable, otherwise creating the first admin ' +
  'user from the Welcome page will hang on the breach check. Scope: admin tenant only ' +
  "— the default tenant's password policy is unaffected and stays admin-controlled " +
  'via the Admin Console.';
