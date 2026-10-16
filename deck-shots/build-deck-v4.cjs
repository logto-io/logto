const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'MeshX platform for banks: scope and screens';

const NAVY = '1E2761';
const INK = '1B1B2F';
const MUTED = '5A5F73';
const TINT = 'F3F2FA';
const HEAD = 'Cambria';
const BODY = 'Calibri';
const STATUS = { Proven: '1E7B4F', Partial: 'A86B00', Gap: 'B3261E', Designed: '5A5F73' };

const frame = (title, lead) => {
  const s = pres.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText(title, { x: 0.6, y: 0.45, w: 12.1, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: NAVY, margin: 0, isTextBox: true });
  if (lead) s.addText(lead, { x: 0.6, y: 1.25, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 18, color: MUTED, margin: 0, isTextBox: true });
  return s;
};

const points = (items) => items.map((text, i) => ({ text, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 } }));

// Screenshot on the left, short points on the right.
const shot = (title, lead, image, items) => {
  const s = frame(title, lead);
  const h = 5.0;
  const w = h * (1920 / 1625);
  s.addImage({ path: image, x: 0.6, y: 1.95, w, h });
  const x = 0.6 + w + 0.4;
  s.addText(points(items), { x, y: 1.95, w: 12.73 - x, h: 5.0, fontFace: BODY, fontSize: 17, color: INK, valign: 'top', margin: 0, isTextBox: true });
};

const table = (s, rows, colW, y) => {
  const data = rows.map((row, r) => row.map((cell, c) => {
    if (r === 0) return { text: cell, options: { bold: true, color: 'FFFFFF', fill: { color: NAVY }, fontFace: BODY, fontSize: 13 } };
    if (c === 1 && STATUS[cell]) return { text: cell, options: { bold: true, color: STATUS[cell], fontFace: BODY, fontSize: 13 } };
    return { text: cell, options: { color: INK, fontFace: BODY, fontSize: 13, fill: { color: r % 2 ? 'FFFFFF' : TINT } } };
  }));
  s.addTable(data, { x: 0.6, y, w: 12.1, colW, rowH: 0.42, border: { type: 'solid', color: 'D8D6E8', pt: 0.5 }, margin: 0.06, valign: 'middle' });
};

// 1. Title
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addText('MeshX platform for banks', { x: 0.8, y: 2.1, w: 11.7, h: 1.2, fontFace: HEAD, fontSize: 44, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText('Scope and screens. What runs in your network, and what is built.', { x: 0.8, y: 3.4, w: 11.7, h: 0.8, fontFace: BODY, fontSize: 20, color: 'CADCFC', margin: 0, isTextBox: true });
}

// 2. Purpose
{
  const s = frame('Purpose of this session', 'Two questions. Can it run in your network? What is ready today?');
  s.addText(points([
    'The platform runs in your own network. No meshX control plane is needed.',
    'You get a capability map: what we supply, and what you supply.',
    'You get a clear status: built, partly built, or not started.',
    'You get next steps, with owners.',
  ]), { x: 0.6, y: 2.0, w: 12.1, h: 4.5, fontFace: BODY, fontSize: 20, color: INK, valign: 'top', margin: 0, isTextBox: true });
}

// 3. Capability map
{
  const s = frame('Capability map', 'Status of each capability, from the code today');
  table(s, [
    ['Capability', 'Status', 'What exists'],
    ['Foundation workspace operator (pull-based)', 'Proven', 'Kubernetes operator. Direct (Helm) or Flux mode. Ordered deploys.'],
    ['Helm chart set', 'Proven', '23 charts, including Postgres, Redis, Kafka, NATS, Trino and object storage'],
    ['Air-gap bundle import', 'Partial', 'Upload and import. Checksums. In-cluster registry. Image references not yet rewritten.'],
    ['Identity (Logto)', 'Partial', 'Logto chart and OAuth link. Product templates still default to Auth0.'],
    ['LLM access', 'Partial', 'LiteLLM gateway. Default is the public API. Bedrock not yet tested.'],
    ['Cost visibility', 'Proven', 'Price tables and cost per call. Visibility only.'],
    ['Model routing', 'Gap', 'Host mapping only. No model selection.'],
    ['GPU and on-prem models', 'Gap', 'No GPU requests. No path to an on-prem model.'],
    ['Federation across entities', 'Gap', 'One namespace per tenant. No federation code.'],
    ['Operator access', 'Gap', 'Tailscale only. Bastion and break-glass not defined.'],
  ], [3.8, 1.6, 6.7], 1.9);
}

// 4-9. Identity and access screens
shot('Multi-factor authentication', 'Set MFA for each tenant', 'crops/logto-mfa.png', [
  'Set when MFA is required: optional or enforced.',
  'Select the factors the bank accepts.',
  'Backup codes give a recovery path. The policy stays strong.',
]);
shot('Security settings', 'Set password, CAPTCHA and sign-up rules', 'crops/logto-security.png', [
  'Set password rules for all users.',
  'Turn on CAPTCHA for sign-in and sign-up.',
  'Every change applies to the whole tenant.',
]);
shot('Enterprise single sign-on', 'Staff use the bank’s identity provider', 'crops/logto-enterprise-sso.png', [
  'Enterprise SSO connects to SAML and OIDC providers.',
  'Each connector is linked to an email domain.',
  'Staff do not need a second password for the platform.',
]);
shot('Sign-up control', 'Block high-risk email domains at sign-up', 'crops/logto-blocklist.png', [
  'Reject disposable domains and subaddresses.',
  'Allow only the partner domains the bank approves.',
  'Rules apply to new sign-ups and new linked emails.',
]);
shot('Foundation workspace wizard', 'Create a foundation workspace from an approved template', 'crops/logto-wizard.png', [
  'Pick Full, Lite, or Dashboard AI only.',
  'Set the tenant and mode, then review the YAML.',
  'Create. The foundation workspace appears in the foundation workspaces list.',
]);
shot('Sign-in experience', 'Branding and sign-in options for the tenant', 'crops/logto-sign-in-experience.png', [
  'Set the logo, colors, and sign-in methods.',
  'Changes apply to the sign-in page at once.',
  'Custom sign-in UI is available without a license.',
]);

// 10. Audit
shot('Audit trail', 'Each token exchange is recorded by application and time', 'crops/logto-audit-logs.png', [
  'Filter by event, application, and time.',
  'Export the log for internal audit and regulator requests.',
  'Map each control to a log entry before the review.',
]);

// 11-12. Operations
shot('Foundation workspaces', 'Phase and component status for each environment', 'crops/logto-infrastructure.png', [
  'Each foundation workspace uses an approved template: Full, Lite, or Dashboard AI only.',
  'Component status, such as 22/22, shows if a deployment is complete.',
  'Confirm the core chart settings before a hardening claim is made.',
]);
shot('Capacity map', 'Live CPU and memory use for each node and pod', 'crops/logto-capacity-map.png', [
  'Pods are sized by live usage on each node.',
  'Hatched space shows capacity that is not allocated.',
  'Switch between CPU and memory.',
]);

// 12b. Sign-in flow as steps, with the full diagram in the appendix
{
  const s = frame('How sign-in works', 'Each step, from the user to the identity provider');
  table(s, [
    ['Step', 'From', 'To', 'What happens'],
    ['1. Login redirect', 'User browser', 'Tenant frontend', 'The user starts sign-in.'],
    ['2. OIDC authorization code', 'Frontend', 'Identity provider', 'The provider returns an authorization code.'],
    ['3. Tokens', 'Identity provider', 'Frontend', 'The frontend receives the tokens.'],
    ['4. API call with access token', 'Frontend', 'Backend', 'The backend receives the access token.'],
    ['5. Verify issuer and audience', 'Backend', 'Identity provider', 'The backend checks each token before it is used.'],
  ], [3.6, 2.2, 2.6, 3.7], 1.9);
  s.addText('Logto is the target provider. Product templates still point to Auth0 today.', { x: 0.6, y: 5.6, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0, isTextBox: true });
}
{
  const s = frame('Appendix: full sign-in diagram', 'Zoom in for the labels. Both sides of the flow are shown.');
  s.addImage({ path: 'crops/auth-flow.png', x: 0.6, y: 1.9, w: 12.1, h: 12.1 * (1855 / 6428) });
}

// 12c. Secrets management
{
  const s = frame('Secrets management', 'Secrets stay in a vault. They are not stored in charts or configuration files.');
  table(s, [
    ['Component', 'State', 'Role'],
    ['Vault (in-cluster, kubo-vault namespace)', 'Partial', 'Holds tenant secrets. Runs in the demo cluster.'],
    ['External Secrets Operator', 'Partial', 'Copies secrets from the vault into tenant namespaces. About ten charts use it.'],
    ['Store definitions per environment', 'Gap', 'Charts name the stores. Store definitions must be supplied per environment.'],
    ['Plaintext secrets in configuration', 'Gap', 'Must be removed before a customer install. Verified check still to run.'],
    ['Key rotation and access audit', 'Gap', 'Not built. Needed for the security review.'],
  ], [4.6, 1.6, 5.9], 1.9);
  s.addText('Secrets stay in the vault. Each environment supplies its own store definitions before any install.', { x: 0.6, y: 5.9, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0, isTextBox: true });
}

// 13. Release
{
  const s = frame('Release and delivery in your network', 'Six steps, with the state of each');
  table(s, [
    ['Step', 'State', 'Note'],
    ['1. Build and sign the foundation workspace bundle', 'Partial', 'Bundles are supported. Signing is not yet verified.'],
    ['2. Push the bundle to your registry', 'Designed', 'The cluster does not yet pull from your registry in a closed install.'],
    ['3. Operator detects the new version', 'Proven', 'Pull-based reconcile in Direct or Flux mode.'],
    ['4. Your approval gate', 'Gap', 'Not built.'],
    ['5. Promotion to the target foundation workspace', 'Partial', 'Ordered apply and cleanup. No promotion across environments.'],
    ['6. Rollback to a prior version', 'Gap', 'Not built as a user workflow.'],
  ], [4.6, 1.6, 5.9], 1.9);
  s.addText('No service level is quoted yet. The release interval is agreed with your change team.', { x: 0.6, y: 5.8, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0, isTextBox: true });
}

// 14. Inference
{
  const s = frame('Inference inside your boundary', 'Bedrock-only operation. Not yet verified in a running environment.');
  table(s, [
    ['Requirement', 'State', 'Test to pass'],
    ['Bedrock as the model provider', 'Gap', 'A chat request completes with no public call'],
    ['Approved models and region', 'Gap', 'Only approved model IDs are reachable'],
    ['IAM role for the service', 'Gap', 'Requests are signed with the role. No static key.'],
    ['Private endpoint and DNS', 'Gap', 'The model name resolves to the private endpoint'],
    ['Logs and keys', 'Gap', 'Invocation logs are kept in your account and encrypted with your key'],
  ], [4.4, 1.6, 6.1], 1.9);
  s.addText('A test environment is built first. The results are reported before the next review.', { x: 0.6, y: 5.6, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0, isTextBox: true });
}

// 15. Decisions
{
  const s = frame('Decisions we need from you', 'Your answers set the order of the work');
  s.addText(points([
    'Which AWS services are approved, and in which region?',
    'Does the platform run in AWS, on premises, or both?',
    'Do you need GPU nodes, or access to your existing model endpoint?',
    'Which models are approved, and how is access given?',
    'Who runs the platform day to day?',
    'Which operator access model do you require?',
    'Is identity federation needed from day one?',
    'Where does the data target run, and who owns the network path?',
  ]), { x: 0.6, y: 1.9, w: 12.1, h: 5.0, fontFace: BODY, fontSize: 18, color: INK, valign: 'top', margin: 0, isTextBox: true });
}

// 16. Next steps
{
  const s = frame('Next steps', 'Items not yet built. Owners and dates are to be confirmed.');
  table(s, [
    ['Action', 'Owner', 'Timing'],
    ['Prove Bedrock-only operation in a new test environment', 'meshX', 'Before the next review'],
    ['Pull images from your registry, with a no-outside-access test', 'meshX platform', 'To confirm'],
    ['Default to Logto for closed-network installs', 'meshX platform', 'To confirm'],
    ['Add your approval gate and promotion steps to the release flow', 'To assign', 'To confirm'],
    ['Build a user rollback workflow', 'To assign', 'To confirm'],
    ['Plan GPU and on-premises model support after your answer', 'To assign', 'After your answer'],
    ['Choose the data sharing network option with your network team', 'meshX with your network team', 'After your answer'],
  ], [7.2, 3.1, 1.8], 1.9);
}

pres.writeFile({ fileName: 'meshx-bank-scope-v4.pptx' }).then((f) => console.log('wrote', f));
