import TextLink from '@/components/TextLink';
import useStartIdentifierPasskeyProcessing from '@/hooks/use-start-identifier-passkey-processing';
import SwitchIcon from '@/shared/assets/icons/switch-icon.svg?react';
import { type VerificationCodeIdentifier } from '@/types';

type Props = {
  readonly className?: string;
  readonly identifier: VerificationCodeIdentifier;
  readonly value: string;
};

const PasskeySignInLink = ({ className, identifier, value }: Props) => {
  const onClickPasskeyMethod = useStartIdentifierPasskeyProcessing();

  return (
    <TextLink
      replace
      className={className}
      icon={<SwitchIcon />}
      text="action.sign_in_via_passkey"
      onClick={() => {
        void onClickPasskeyMethod({ type: identifier, value });
      }}
    />
  );
};

export default PasskeySignInLink;
