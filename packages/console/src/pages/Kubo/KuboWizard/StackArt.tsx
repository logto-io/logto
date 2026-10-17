import { type StackOption } from './options';

// Flat illustrations for each stack card, drawn in the wizard's purple and amber palette.
const frame = { width: 120, height: 88 };

function ArtFoundationHa() {
  return (
    <svg viewBox={`0 0 ${frame.width} ${frame.height}`} aria-hidden="true" focusable="false">
      <rect x="18" y="10" width="84" height="18" rx="4" fill="#6b4ef6" />
      <rect x="18" y="34" width="84" height="18" rx="4" fill="#8f7cf8" />
      <rect x="18" y="58" width="84" height="18" rx="4" fill="#c9bfff" />
      <circle cx="28" cy="19" r="3" fill="#f6c177" />
      <circle cx="28" cy="43" r="3" fill="#f6c177" />
      <circle cx="28" cy="67" r="3" fill="#f6c177" />
      <path d="M86 12v70" stroke="#2d2a4a" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

function ArtFoundation() {
  return (
    <svg viewBox={`0 0 ${frame.width} ${frame.height}`} aria-hidden="true" focusable="false">
      <rect x="28" y="10" width="64" height="68" rx="6" fill="#6b4ef6" />
      <rect x="36" y="20" width="48" height="10" rx="2" fill="#c9bfff" />
      <rect x="36" y="38" width="48" height="10" rx="2" fill="#8f7cf8" />
      <rect x="36" y="56" width="30" height="10" rx="2" fill="#8f7cf8" />
      <circle cx="78" cy="61" r="4" fill="#f6c177" />
    </svg>
  );
}

function ArtDashboardsAi() {
  return (
    <svg viewBox={`0 0 ${frame.width} ${frame.height}`} aria-hidden="true" focusable="false">
      <rect x="14" y="12" width="92" height="64" rx="6" fill="#2d2a4a" />
      <rect x="24" y="52" width="10" height="16" fill="#8f7cf8" />
      <rect x="40" y="40" width="10" height="28" fill="#6b4ef6" />
      <rect x="56" y="30" width="10" height="38" fill="#c9bfff" />
      <rect x="72" y="22" width="10" height="46" fill="#f6c177" />
      <path d="M96 6l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#f6c177" />
    </svg>
  );
}

function ArtFoundationAi() {
  return (
    <svg viewBox={`0 0 ${frame.width} ${frame.height}`} aria-hidden="true" focusable="false">
      <rect x="34" y="26" width="52" height="40" rx="6" fill="#6b4ef6" />
      <path
        d="M46 26v-8M60 26v-8M74 26v-8M46 66v8M60 66v8M74 66v8"
        stroke="#2d2a4a"
        strokeWidth="3"
      />
      <circle cx="60" cy="46" r="8" fill="#f6c177" />
    </svg>
  );
}

const artByOption: Readonly<Record<StackOption['id'], () => JSX.Element>> = {
  foundation: ArtFoundationHa,
  dai: ArtDashboardsAi,
  fai: ArtFoundationAi,
  v1: ArtFoundation,
};

export function StackArt({ id }: { readonly id: StackOption['id'] }) {
  const Art = artByOption[id];

  return <Art />;
}
