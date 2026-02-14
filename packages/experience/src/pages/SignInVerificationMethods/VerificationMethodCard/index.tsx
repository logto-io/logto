import classNames from 'classnames';
import { type TFuncKey } from 'i18next';

import ArrowNext from '@/shared/assets/icons/arrow-next.svg?react';
import buttonStyles from '@/shared/components/Button/index.module.scss';
import DynamicT from '@/shared/components/DynamicT';
import FlipOnRtl from '@/shared/components/FlipOnRtl';

import styles from './index.module.scss';

type Props = {
  readonly Icon: SvgComponent;
  readonly titleKey: TFuncKey;
  readonly descriptionKey: TFuncKey;
  readonly descriptionProps?: Record<string, unknown>;
  readonly onClick: () => void;
};

const VerificationMethodCard = ({
  Icon,
  titleKey,
  descriptionKey,
  descriptionProps,
  onClick,
}: Props) => {
  return (
    <button
      className={classNames(
        buttonStyles.button,
        buttonStyles.secondary,
        buttonStyles.large,
        styles.button
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className={styles.icon} />
      <div className={styles.title}>
        <div className={styles.name}>
          <DynamicT forKey={titleKey} />
        </div>
        <div className={styles.description}>
          <DynamicT forKey={descriptionKey} interpolation={descriptionProps} />
        </div>
      </div>
      <FlipOnRtl>
        <ArrowNext className={styles.icon} />
      </FlipOnRtl>
    </button>
  );
};

export default VerificationMethodCard;
