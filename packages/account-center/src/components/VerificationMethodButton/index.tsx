import ArrowNext from '@experience/shared/assets/icons/arrow-next.svg?react';
import styles from '@experience/shared/components/Button/index.module.scss';
import DynamicT from '@experience/shared/components/DynamicT';
import FlipOnRtl from '@experience/shared/components/FlipOnRtl';
import classNames from 'classnames';
import { type TFuncKey } from 'i18next';
import type { ComponentType, SVGProps } from 'react';

import EmailIcon from '@ac/assets/icons/email.svg?react';
import PasswordIcon from '@ac/assets/icons/password.svg?react';
import PhoneIcon from '@ac/assets/icons/phone.svg?react';
import { VerificationMethod } from '@ac/types';

import verificationMethodStyles from './index.module.scss';

export type Props = {
  readonly method: VerificationMethod;
  readonly onClick?: () => void;
};

type MethodContent = {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  nameKey: TFuncKey;
  descriptionKey: TFuncKey;
};

const methodContentMap: Partial<Record<VerificationMethod, MethodContent>> = {
  [VerificationMethod.Password]: {
    icon: PasswordIcon,
    nameKey: 'account_center.verification_method.password.name',
    descriptionKey: 'account_center.verification_method.password.description',
  },
  [VerificationMethod.EmailCode]: {
    icon: EmailIcon,
    nameKey: 'account_center.verification_method.email.name',
    descriptionKey: 'account_center.verification_method.email.description',
  },
  [VerificationMethod.PhoneCode]: {
    icon: PhoneIcon,
    nameKey: 'account_center.verification_method.phone.name',
    descriptionKey: 'account_center.verification_method.phone.description',
  },
};

const VerificationMethodButton = ({ method, onClick }: Props) => {
  const content = methodContentMap[method];

  if (!content) {
    return null;
  }

  const { icon: Icon, nameKey, descriptionKey } = content;

  return (
    <button
      className={classNames(
        styles.button,
        styles.secondary,
        styles.large,
        verificationMethodStyles.button
      )}
      type="button"
      onClick={onClick}
    >
      <Icon className={verificationMethodStyles.icon} />
      <div className={verificationMethodStyles.title}>
        <div className={verificationMethodStyles.name}>
          <DynamicT forKey={nameKey} />
        </div>
        <div className={verificationMethodStyles.description}>
          <DynamicT forKey={descriptionKey} />
        </div>
      </div>
      <FlipOnRtl>
        <ArrowNext className={verificationMethodStyles.icon} />
      </FlipOnRtl>
    </button>
  );
};

export default VerificationMethodButton;
