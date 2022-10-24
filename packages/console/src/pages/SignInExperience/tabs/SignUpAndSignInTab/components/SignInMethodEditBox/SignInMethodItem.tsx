import { SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { snakeCase } from 'snake-case';

import Draggable from '@/assets/images/draggable.svg';
import Minus from '@/assets/images/minus.svg';
import SwitchArrowIcon from '@/assets/images/switch-arrow.svg';
import Checkbox from '@/components/Checkbox';
import IconButton from '@/components/IconButton';

import * as styles from './index.module.scss';
import type { SignInMethod } from './types';

type Props = {
  signInMethod: SignInMethod;
  isPasswordRequired: boolean;
  isVerificationRequired: boolean;
  isDeletable: boolean;
  onVerificationStateChange: (
    identifier: SignInIdentifier,
    verification: 'password' | 'verificationCode',
    checked: boolean
  ) => void;
  onToggleVerificationPrimary: (identifier: SignInIdentifier) => void;
  onDelete: (identifier: SignInIdentifier) => void;
};

const SignInMethodItem = ({
  signInMethod: { identifier, password, verificationCode, isPasswordPrimary },
  isPasswordRequired,
  isVerificationRequired,
  isDeletable,
  onVerificationStateChange,
  onToggleVerificationPrimary,
  onDelete,
}: Props) => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  return (
    <div key={snakeCase(identifier)} className={styles.signInMethodItem}>
      <div className={styles.signInMethod}>
        <div className={styles.identifier}>
          <Draggable className={styles.draggableIcon} />
          {t('sign_in_exp.sign_up_and_sign_in.identifiers', {
            context: snakeCase(identifier),
          })}
        </div>
        <div
          className={classNames(
            styles.authentication,
            !isPasswordPrimary && styles.verifyCodePrimary
          )}
        >
          <Checkbox
            label={t('sign_in_exp.sign_up_and_sign_in.sign_in.password_auth')}
            value={password}
            disabled={isPasswordRequired}
            onChange={(checked) => {
              onVerificationStateChange(identifier, 'password', checked);
            }}
          />
          {identifier !== SignInIdentifier.Username && (
            <>
              <IconButton
                tooltip="sign_in_exp.sign_up_and_sign_in.sign_in.auth_swap_tip"
                onClick={() => {
                  onToggleVerificationPrimary(identifier);
                }}
              >
                <SwitchArrowIcon />
              </IconButton>
              <Checkbox
                label={t('sign_in_exp.sign_up_and_sign_in.sign_in.verification_code_auth')}
                value={verificationCode}
                disabled={isVerificationRequired && !isPasswordRequired}
                onChange={(checked) => {
                  onVerificationStateChange(identifier, 'verificationCode', checked);
                }}
              />
            </>
          )}
        </div>
      </div>
      <IconButton
        disabled={isDeletable}
        onClick={() => {
          onDelete(identifier);
        }}
      >
        <Minus />
      </IconButton>
    </div>
  );
};

export default SignInMethodItem;
