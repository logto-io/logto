const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'MeshX identity platform for banking';

const NAVY = '1E2761';
const INK = '1B1B2F';
const MUTED = '5A5F73';
const TINT = 'F3F2FA';
const HEAD = 'Cambria';
const BODY = 'Calibri';

const frame = (title, lead) => {
  const s = pres.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText(title, { x: 0.6, y: 0.45, w: 12.1, h: 0.8, fontFace: HEAD, fontSize: 36, bold: true, color: NAVY, margin: 0, isTextBox: true });
  if (lead) s.addText(lead, { x: 0.6, y: 1.25, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 18, color: MUTED, margin: 0, isTextBox: true });
  return s;
};

const points = (items) => items.map((text, i) => ({
  text,
  options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 10 },
}));

// Screenshot slide: image on the left, claim and points on the right.
const NOTES = {
  'Strong sign-in for staff and customers': 'Lead with the risk: a stolen password alone should not open a bank system. Show the factor list, then the policy choice.',
  'Control who can open an account': 'Disposable and alias addresses are a common route for fake accounts. The blocklist and allowlist are set once and apply to every sign-up.',
  'Use the bank\u2019s identity provider.': 'Staff keep the identity provider they already use. Routing is by email domain, so there is no second password for employees.',
  'A record of each sign-in event.': 'This is the page for the audit team. Every row is a token exchange tied to an application and a time.',
  'Only approved deployments run.': 'For operations: each environment shows whether it is complete, and new environments start from the same templates.',
};

const shotSlide = (title, lead, image, items) => {
  const s = frame(title, lead);
  if (NOTES[title]) s.addNotes(NOTES[title]);
  const h = 5.2;
  const w = h * (1920 / 1625);
  s.addImage({ path: image, x: 0.6, y: 1.95, w, h });
  const x = 0.6 + w + 0.4;
  s.addText(points(items), { x, y: 1.95, w: 12.73 - x, h: 5.0, fontFace: BODY, fontSize: 18, color: INK, valign: 'top', margin: 0, isTextBox: true });
};

// 1. Title
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addText('MeshX identity platform for banking', { x: 0.8, y: 2.3, w: 11.7, h: 1.2, fontFace: HEAD, fontSize: 44, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText('Who signs in. How they prove identity. What the platform records.', { x: 0.8, y: 3.6, w: 11.7, h: 0.6, fontFace: BODY, fontSize: 20, color: 'CADCFC', margin: 0, isTextBox: true });
}

// 2. Executive summary
{
  const s = frame('Three outcomes for the bank', 'The results after the platform is set up.');
  const cards = [
    ['Control access', 'Enforce MFA, block high-risk sign-up domains, and federate staff through the bank’s own identity provider.'],
    ['Prove what happened', 'Every token and admin change is recorded. The bank can export and review the records.'],
    ['Run it with discipline', 'Stacks deploy from approved templates. Health, capacity, and cost are shown in one place.'],
  ];
  cards.forEach(([head, body], i) => {
    const x = 0.6 + i * 4.2;
    s.addShape(pres.ShapeType.roundRect, { x, y: 2.1, w: 3.9, h: 2.9, fill: { color: TINT }, line: { color: TINT }, rectRadius: 0.12 });
    s.addText(head, { x: x + 0.3, y: 2.4, w: 3.3, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(body, { x: x + 0.3, y: 3.1, w: 3.3, h: 2.6, fontFace: BODY, fontSize: 18, color: INK, valign: 'top', margin: 0, isTextBox: true });
  });
}

// 3. Access: MFA
shotSlide(
  'Strong sign-in for staff and customers',
  'MFA is set once for each tenant.',
  'crops/logto-mfa.png',
  [
    'Set when MFA is required: optional or enforced.',
    'Select the factors the bank accepts, for example one-time codes.',
    'Backup codes give a recovery path. The policy stays strong.',
  ]
);

// 4. Access: sign-up control
shotSlide(
  'Control who can open an account',
  'Block high-risk email domains at sign-up.',
  'crops/logto-blocklist.png',
  [
    'Reject disposable domains and subaddresses. Example: name+alias@domain.',
    'Allow only the partner domains the bank approves.',
    'Rules apply to new sign-ups and new linked emails.',
  ]
);

// 5. Federation
shotSlide(
  'Use the bank’s own identity provider',
  'Enterprise SSO connects to SAML and OIDC providers.',
  'crops/logto-enterprise-sso.png',
  [
    'Staff sign in with their current identity provider.',
    'Each connector is linked to an email domain. Routing is automatic.',
    'No separate password store for employees.',
  ]
);

// 6. Audit trail
shotSlide(
  'A record of each sign-in event.',
  'The audit log shows each token, by application and time.',
  'crops/logto-audit-logs.png',
  [
    'Filter by event, application, and time.',
    'Each row is a token exchange. The bank can trace it to an application.',
    'Export the log for internal audit and regulator requests.',
  ]
);

// 7. Governance
shotSlide(
  'Only approved deployments run.',
  'Stacks show phase and component status for each environment.',
  'crops/logto-infrastructure.png',
  [
    'Each stack uses an approved template: Full, Lite, or Dashboard AI only.',
    'Component status, such as 22/22, shows if a deployment is complete.',
    'New environments use the same templates. There is one path to production.',
  ]
);

// 8. Next steps
{
  const s = frame('Proposed next steps', 'A pilot proves the controls before wider rollout.');
  const steps = [
    ['1. Pilot one application', 'Connect one staff application to the bank identity provider. Enforce MFA.'],
    ['2. Confirm the audit export', 'Agree the log format and retention with the bank’s audit team.'],
    ['3. Expand by stack', 'Move the next environment to approved templates after the pilot passes review.'],
  ];
  steps.forEach(([head, body], i) => {
    const y = 2.1 + i * 1.4;
    s.addText(head, { x: 0.6, y, w: 4.2, h: 0.6, fontFace: HEAD, fontSize: 22, bold: true, color: NAVY, margin: 0, isTextBox: true });
    s.addText(body, { x: 5.0, y, w: 7.7, h: 0.9, fontFace: BODY, fontSize: 18, color: INK, valign: 'top', margin: 0, isTextBox: true });
  });
}

pres.writeFile({ fileName: 'bank-use-case-v2.pptx' }).then((f) => console.log('wrote', f));
