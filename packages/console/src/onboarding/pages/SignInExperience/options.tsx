import { SignInIdentifier } from '@logto/schemas';

import Envelop from '@/assets/icons/envelop.svg?react';
import Keyboard from '@/assets/icons/keyboard.svg?react';
import Label from '@/assets/icons/label.svg?react';
import Lock from '@/assets/icons/lock.svg?react';
import DangerousRaw from '@/ds-components/DangerousRaw';
import type {
  MultiCardSelectorOption,
  CardSelectorOption,
} from '@/onboarding/components/CardSelector';

import Apple from '../../assets/icons/social-apple.svg?react';
import Facebook from '../../assets/icons/social-facebook.svg?react';
import Kakao from '../../assets/icons/social-kakao.svg?react';
import Microsoft from '../../assets/icons/social-microsoft.svg?react';
import Oidc from '../../assets/icons/social-oidc.svg?react';

import { Authentication } from './types';

export const identifierOptions: CardSelectorOption[] = [
  {
    icon: <Envelop />,
    title: 'sign_in_exp.sign_up_and_sign_in.identifiers_email',
    value: SignInIdentifier.Email,
  },
  {
    icon: <Label />,
    title: 'sign_in_exp.sign_up_and_sign_in.identifiers_username',
    value: SignInIdentifier.Username,
  },
];

export const authenticationOptions: MultiCardSelectorOption[] = [
  {
    icon: <Lock />,
    title: 'sign_in_exp.sign_up_and_sign_in.sign_in.password_auth',
    value: Authentication.Password,
  },
  {
    icon: <Keyboard />,
    title: 'sign_in_exp.sign_up_and_sign_in.sign_in.verification_code_auth',
    value: Authentication.VerificationCode,
  },
];

export const fakeSocialTargetOptions: MultiCardSelectorOption[] = [
  {
    icon: <Apple />,
    title: <DangerousRaw>Apple</DangerousRaw>,
    value: 'fake-apple',
    tag: 'cloud.sie.connectors.unlocked_later',
    isDisabled: true,
    disabledTip: 'cloud.sie.connectors.unlocked_later_tip',
  },
  {
    icon: <Facebook />,
    title: <DangerousRaw>Facebook</DangerousRaw>,
    value: 'fake-facebook',
    tag: 'cloud.sie.connectors.unlocked_later',
    isDisabled: true,
    disabledTip: 'cloud.sie.connectors.unlocked_later_tip',
  },
  {
    icon: <Microsoft />,
    title: <DangerousRaw>Microsoft</DangerousRaw>,
    value: 'fake-microsoft',
    tag: 'cloud.sie.connectors.unlocked_later',
    isDisabled: true,
    disabledTip: 'cloud.sie.connectors.unlocked_later_tip',
  },
  {
    icon: <Kakao />,
    title: <DangerousRaw>Kakao</DangerousRaw>,
    value: 'fake-kakao',
    tag: 'cloud.sie.connectors.unlocked_later',
    isDisabled: true,
    disabledTip: 'cloud.sie.connectors.unlocked_later_tip',
  },
  {
    icon: <Oidc />,
    title: <DangerousRaw>OIDC</DangerousRaw>,
    value: 'fake-oidc',
    tag: 'cloud.sie.connectors.unlocked_later',
    isDisabled: true,
    disabledTip: 'cloud.sie.connectors.unlocked_later_tip',
  },
];
