const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'MeshX platform for Barclays: technical scope';

const NAVY = '1E2761';
const INK = '1B1B2F';
const MUTED = '5A5F73';
const TINT = 'F3F2FA';
const HEAD = 'Cambria';
const BODY = 'Calibri';
const STATUS = { 'Proven': '1E7B4F', 'Partial': 'A86B00', 'Gap': 'B3261E', 'Designed': '5A5F73' };

const frame = (title, lead) => {
  const s = pres.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText(title, { x: 0.6, y: 0.45, w: 12.1, h: 0.8, fontFace: HEAD, fontSize: 34, bold: true, color: NAVY, margin: 0, isTextBox: true });
  if (lead) s.addText(lead, { x: 0.6, y: 1.25, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 18, color: MUTED, margin: 0, isTextBox: true });
  return s;
};

const points = (items) => items.map((text, i) => ({ text, options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 } }));

const shotSlide = (title, lead, image, items, notes) => {
  const s = frame(title, lead);
  if (notes) s.addNotes(notes);
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
  s.addText('MeshX platform for Barclays', { x: 0.8, y: 2.1, w: 11.7, h: 1.2, fontFace: HEAD, fontSize: 44, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText('Technical scope: what runs in your VPC, what is built, and what is not yet started', { x: 0.8, y: 3.4, w: 11.7, h: 0.8, fontFace: BODY, fontSize: 20, color: 'CADCFC', margin: 0, isTextBox: true });
}

// 2. Purpose
{
  const s = frame('Purpose of this session', 'Barclays asked whether Foundation can run in its own VPC, without a meshX-operated control plane');
  s.addText(points([
    'Leave with a capability map. It shows which services Barclays supplies and which run in the cluster.',
    'Leave with an honest list of what is built, designed, and not started.',
    'Agree next steps, with owners, for the parts not yet built.',
    'Out of scope: commercial terms, staffing, and legal terms.',
  ]), { x: 0.6, y: 2.0, w: 12.1, h: 4.5, fontFace: BODY, fontSize: 20, color: INK, valign: 'top', margin: 0, isTextBox: true });
}

// 3. Capability map
{
  const s = frame('Capability map', 'Status of each capability, based on the repository today');
  table(s, [
    ['Capability', 'Status', 'What exists'],
    ['Stack operator (pull-based reconcile)', 'Proven', 'Kubernetes operator; Direct (Helm) or Flux mode; dependency-ordered deploys'],
    ['Helm chart set', 'Proven', '23 charts, including CloudNativePG, Redis, Kafka, NATS, Trino and S3-compatible storage'],
    ['Air-gap bundle import', 'Partial', 'Upload and import APIs, SHA256 checks, in-cluster registry; image references not yet rewritten'],
    ['Identity (Logto)', 'Partial', 'Logto chart and OAuth integration; product templates still default to Auth0'],
    ['LLM access', 'Partial', 'LiteLLM gateway; default is the public Anthropic API; Bedrock not yet tested'],
    ['Cost visibility', 'Proven', 'Per-request price tables and cost per call; visibility only'],
    ['Model routing', 'Gap', 'Host-to-upstream mapping only; no model selection'],
    ['GPU and on-prem models', 'Gap', 'No GPU requests; no path to an on-prem model endpoint'],
    ['Federation across entities', 'Gap', 'One namespace per tenant; no federation code'],
    ['Operator access', 'Gap', 'Only Tailscale found; bastion and break-glass not defined'],
  ], [3.8, 1.6, 6.7], 1.9);
}

// 4. Release and delivery
{
  const s = frame('Release and delivery in an air-gapped VPC', 'Six steps, with the current state of each');
  table(s, [
    ['Step', 'State', 'Note'],
    ['1. Build and sign the stack bundle (OCI)', 'Partial', 'OCI bundles are supported; signing is not yet verified'],
    ['2. Push the bundle to the customer registry', 'Designed', 'The cluster does not yet pull from a customer registry in an air-gap install'],
    ['3. Operator detects the new version', 'Proven', 'Pull-based reconcile in Direct or Flux mode'],
    ['4. Customer approval gate', 'Gap', 'Not built'],
    ['5. Promotion to the target stack', 'Partial', 'Dependency-ordered apply and pruning; no promotion across environments'],
    ['6. Rollback to a prior version', 'Gap', 'Helm rollback is used only to recover stuck releases'],
  ], [4.6, 1.6, 5.9], 1.9);
  s.addText('Release cadence: a train agreed with Barclays change management, plus a separate lane for critical security patches. No SLA is quoted yet.', { x: 0.6, y: 5.8, w: 12.1, h: 0.6, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0, isTextBox: true });
}

// 5. Inference and data residency
{
  const s = frame('Inference inside the Barclays boundary', 'Bedrock-only operation. Not yet verified in a running environment.');
  table(s, [
    ['Requirement', 'State', 'Pass test in the AWS test environment'],
    ['Bedrock as the LiteLLM provider', 'Gap', 'A chat request completes with no public endpoint call'],
    ['Approved model list and region', 'Gap', 'Only Barclays-approved model IDs are reachable'],
    ['IAM role for the service account', 'Gap', 'Requests are signed with the role; no static API key'],
    ['PrivateLink endpoint and private DNS', 'Gap', 'The Bedrock name resolves to the private endpoint'],
    ['Logging and encryption keys', 'Gap', 'Invocation logs land in the customer account, encrypted with a customer key'],
  ], [4.4, 1.6, 6.1], 1.9);
  s.addText('The test environment will be built and the results reported before the session.', { x: 0.6, y: 5.6, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 15, color: MUTED, margin: 0, isTextBox: true });
}

// 6. Identity
shotSlide(
  'Identity: sign-in controls',
  'MFA and sign-up controls are set in the admin console',
  'crops/logto-mfa.png',
  [
    'Set when MFA is required: optional or enforced.',
    'Select the factors the bank accepts.',
    'Backup codes give a recovery path. The policy stays strong.',
    'Auth0 defaults in the product templates must be removed before a Barclays install.',
  ]
);

shotSlide(
  'Identity: federation and sign-up control',
  'Staff use their identity provider. Sign-up domains are controlled.',
  'crops/logto-enterprise-sso.png',
  [
    'Enterprise SSO connects to SAML and OIDC providers.',
    'Each connector is linked to an email domain.',
    'Block disposable and high-risk domains at sign-up.',
  ]
);

// 7. Audit
shotSlide(
  'Audit trail',
  'Each token exchange is recorded by application and time',
  'crops/logto-audit-logs.png',
  [
    'Filter by event, application, and time.',
    'Export the log for internal audit and regulator requests.',
    'Audit evidence inside the cluster needs a mapping to each control. This is to be completed before the review.',
  ]
);

// 8. Governance and stacks
shotSlide(
  'Stacks and operations',
  'Stack phase and component status for each environment',
  'crops/logto-infrastructure.png',
  [
    'Each stack uses an approved template: Full, Lite, or Dashboard AI only.',
    'Component status, such as 22/22, shows if a deployment is complete.',
    'Security hardening: the core charts still need their settings confirmed before we make a hardening claim.',
  ]
);

// 9. Decisions needed
{
  const s = frame('Decisions we need from Barclays', 'Answers set the order of the work');
  s.addText(points([
    'Which AWS services are approved, and in which region?',
    'Does Foundation run in AWS, on-prem, or both?',
    'Do you need GPU nodes for Foundation, or access to your existing model endpoint?',
    'Which Bedrock models are approved, and is access by PrivateLink or an internal gateway?',
    'Who runs the platform day to day: Barclays, meshX, or shared?',
    'Which operator access model do you require: bastion, break-glass, or neither?',
    'Is identity federation to your provider needed from day one?',
    'Where does the Databricks target run, and who owns the network path?',
  ]), { x: 0.6, y: 1.9, w: 12.1, h: 5.0, fontFace: BODY, fontSize: 18, color: INK, valign: 'top', margin: 0, isTextBox: true });
}

// 10. Next steps
{
  const s = frame('Next steps', 'Items not yet built, with owners and dates to confirm');
  table(s, [
    ['Action', 'Owner', 'Timing'],
    ['Prove Bedrock-only operation in a new AWS test environment', 'meshX', 'Before the session'],
    ['Wire the air-gap image pull path to the in-cluster registry, with a no-egress test', 'meshX platform', 'To confirm'],
    ['Default to Logto for air-gap profiles', 'meshX platform', 'To confirm'],
    ['Add a customer approval gate and promotion workflow to the release flow', 'To assign', 'To confirm'],
    ['Build a user-facing rollback workflow', 'To assign', 'To confirm'],
    ['Confirm GPU and on-prem model design after question 3', 'To assign', 'After Barclays answers'],
    ['Choose the Open Sharing network option with Barclays network architects', 'meshX with Barclays network team', 'After Barclays answers'],
  ], [7.2, 3.1, 1.8], 1.9);
}

pres.writeFile({ fileName: 'barclays-technical-scope.pptx' }).then((f) => console.log('wrote', f));
