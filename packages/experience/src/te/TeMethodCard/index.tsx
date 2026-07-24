/* TE:BEGIN qr-push-factor */
/**
 * Same card as `VerificationMethodCard`, reusing its styles, but with plain-string copy
 * so the TripleEnable factors need no entries in the shared phrases package.
 */

import classNames from 'classnames';

import cardStyles from '@/pages/SignInVerificationMethods/VerificationMethodCard/index.module.scss';
import ArrowNext from '@/shared/assets/icons/arrow-next.svg?react';
import buttonStyles from '@/shared/components/Button/index.module.scss';
import FlipOnRtl from '@/shared/components/FlipOnRtl';

/** The TripleEnable mark: three ascending bars. */
const TeMark = ({ className }: { readonly className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="9" width="4" height="12" rx="1.5" fill="currentColor" />
    <rect x="10" y="4" width="4" height="17" rx="1.5" fill="currentColor" opacity="0.7" />
    <rect x="17" y="12" width="4" height="9" rx="1.5" fill="currentColor" opacity="0.45" />
  </svg>
);

type Props = {
  readonly title: string;
  readonly description: string;
  readonly onClick: () => void;
};

const TeMethodCard = ({ title, description, onClick }: Props) => (
  <button
    className={classNames(
      buttonStyles.button,
      buttonStyles.secondary,
      buttonStyles.large,
      cardStyles.button
    )}
    type="button"
    onClick={onClick}
  >
    <TeMark className={cardStyles.icon} />
    <div className={cardStyles.title}>
      <div className={cardStyles.name}>{title}</div>
      <div className={cardStyles.description}>{description}</div>
    </div>
    <FlipOnRtl>
      <ArrowNext className={cardStyles.icon} />
    </FlipOnRtl>
  </button>
);

export default TeMethodCard;
/* TE:END qr-push-factor */
