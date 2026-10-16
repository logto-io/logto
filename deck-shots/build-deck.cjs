const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE';
pres.title = 'MeshX platform for banking';

const NAVY = '1E2761';
const INK = '1B1B2F';
const MUTED = '5A5F73';
const ACCENT = '6639F5';
const FONT_HEAD = 'Cambria';
const FONT_BODY = 'Calibri';

const slideFrame = (title, subtitle) => {
  const s = pres.addSlide();
  s.background = { color: 'FFFFFF' };
  s.addText(title, { x: 0.6, y: 0.45, w: 12.1, h: 0.8, fontFace: FONT_HEAD, fontSize: 36, bold: true, color: NAVY, margin: 0, isTextBox: true });
  if (subtitle) {
    s.addText(subtitle, { x: 0.6, y: 1.2, w: 12.1, h: 0.45, fontFace: FONT_BODY, fontSize: 16, color: MUTED, margin: 0, isTextBox: true });
  }
  return s;
};

const bullets = (items) =>
  items.map((text, i) => ({
    text,
    options: { bullet: true, breakLine: i < items.length - 1, paraSpaceAfter: 8 },
  }));

const screenshotSlide = (title, subtitle, image, points) => {
  const s = slideFrame(title, subtitle);
  // Screenshots are 2000x1472 (about 1.36:1). Fit height 5.4in.
  const h = 5.4;
  const w = h * (2000 / 1472);
  s.addImage({ path: image, x: 0.6, y: 1.8, w, h });
  s.addText(bullets(points), {
    x: 0.6 + w + 0.4,
    y: 1.8,
    w: 12.73 - (0.6 + w + 0.4),
    h: 5.0,
    fontFace: FONT_BODY,
    fontSize: 16,
    color: INK,
    valign: 'top',
    margin: 0,
    isTextBox: true,
  });
  return s;
};

// 1. Title
{
  const s = pres.addSlide();
  s.background = { color: NAVY };
  s.addText('MeshX platform for banking', { x: 0.8, y: 2.3, w: 11.7, h: 1.2, fontFace: FONT_HEAD, fontSize: 44, bold: true, color: 'FFFFFF', margin: 0, isTextBox: true });
  s.addText('Admin console and stack operations, mapped to bank use cases', { x: 0.8, y: 3.6, w: 11.7, h: 0.6, fontFace: FONT_BODY, fontSize: 20, color: 'CADCFC', margin: 0, isTextBox: true });
}

// 2. Stacks
screenshotSlide(
  'Stack health across environments',
  'One view of every deployed stack, its phase, and component readiness',
  'logto-infrastructure.png',
  [
    'Each stack shows phase, mode, and component readiness (for example 22/22).',
    'Use it to evidence that production runs the approved stack versions.',
    'Stacks are created from approved templates (Full, Lite, Dashboard AI only).',
  ]
);

// 3. Capacity
screenshotSlide(
  'Cluster capacity and cost control',
  'Node and pod usage, reserved capacity, and monthly estimate',
  'kubo-capacity.png',
  [
    'Live CPU and memory use per node, refreshed every 10 seconds.',
    'Reserved and idle capacity are shown separately, so cost owners can act on idle spend.',
    'Supports capacity planning evidence for audit and budget reviews.',
  ]
);

// 4. MFA
screenshotSlide(
  'Strong authentication for staff and customers',
  'Multi-factor authentication configured in the admin console',
  'logto-mfa.png',
  [
    'Enforce MFA for administrators and customer sign-in.',
    'Choose factors such as one-time passcodes and backup codes.',
    'Policy changes are logged in the admin audit trail.',
  ]
);

// 5. Blocklist
screenshotSlide(
  'Restrict who can register and sign in',
  'Email blocklist and allowlist rules applied at sign-up',
  'logto-blocklist.png',
  [
    'Block disposable or high-risk email domains and subaddresses.',
    'Allowlist specific domains for employee or partner onboarding.',
    'Rules apply to sign-up and to newly linked emails.',
  ]
);

// 6. Summary
{
  const s = slideFrame('Summary', 'Where each capability maps to a banking requirement');
  const rows = [
    ['Requirement', 'Capability'],
    ['Access control for staff', 'Roles, MFA, admin audit log'],
    ['Customer onboarding restrictions', 'Email blocklist and allowlist'],
    ['Evidence of approved deployments', 'Stacks with phase and component status'],
    ['Cost and capacity governance', 'Capacity map and monthly estimate'],
  ];
  s.addTable(
    rows.map((row, i) =>
      row.map((cell) => ({
        text: cell,
        options: { bold: i === 0, fontFace: FONT_BODY, fontSize: 16, color: i === 0 ? 'FFFFFF' : INK, fill: { color: i === 0 ? NAVY : 'F3F2FA' } },
      }))
    ),
    { x: 0.6, y: 1.9, w: 12.1, colW: [5.5, 6.6], rowH: 0.6, border: { type: 'solid', color: 'D8D6E8', pt: 0.75 }, margin: 0.08 }
  );
}

pres.writeFile({ fileName: 'bank-use-case.pptx' }).then((f) => console.log('wrote', f));
