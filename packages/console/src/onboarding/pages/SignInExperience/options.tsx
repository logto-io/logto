import { SignInIdentifier } from '@logto/schemas';

import Envelop from '@/assets/images/envelop.svg';
import Keyboard from '@/assets/images/keyboard.svg';
import Label from '@/assets/images/label.svg';
import Lock from '@/assets/images/lock.svg';
import Mobile from '@/assets/images/mobile.svg';
import DangerousRaw from '@/components/DangerousRaw';
import type {
  MultiCardSelectorOption,
  CardSelectorOption,
} from '@/onboarding/components/CardSelector';
import { Authentication } from '@/onboarding/types';

import Apple from '../../assets/images/social-apple.svg';
import AzureAd from '../../assets/images/social-azure-ad.svg';
import Facebook from '../../assets/images/social-facebook.svg';
import Kakao from '../../assets/images/social-kakao.svg';
import Oidc from '../../assets/images/social-oidc.svg';
import Smal from '../../assets/images/social-smal.svg';

export const identifierOptions: CardSelectorOption[] = [
  {
    icon: <Envelop />,
    title: 'sign_in_exp.sign_up_and_sign_in.identifiers_email',
    value: SignInIdentifier.Email,
  },
  {
    icon: <Mobile />,
    title: 'sign_in_exp.sign_up_and_sign_in.identifiers_phone',
    value: SignInIdentifier.Phone,
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
    trailingTag: 'general.cap_limit',
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
    icon: <AzureAd />,
    title: <DangerousRaw>Azure Ad</DangerousRaw>,
    value: 'fake-azure-ad',
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
  {
    icon: <Smal />,
    title: <DangerousRaw>SAML</DangerousRaw>,
    value: 'fake-saml',
    tag: 'cloud.sie.connectors.unlocked_later',
    isDisabled: true,
    disabledTip: 'cloud.sie.connectors.unlocked_later_tip',
  },
];
