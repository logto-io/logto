import SignInDiffSection from './SignInDiffSection';
import SignUpDiffSection from './SignUpDiffSection';
import SocialTargetsDiffSection from './SocialTargetsDiffSection';
import type { SignUpDiff, SignInMethodsDiff, SocialTargetsDiff } from './types';
import { isSignInMethodsDifferent, isSignUpDifferent, isSocialTargetsDifferent } from './utilities';

type Props = {
  signUpDiff: SignUpDiff;
  signInMethodsDiff: SignInMethodsDiff;
  socialTargetsDiff: SocialTargetsDiff;
  isAfter?: boolean;
};

const SignUpAndSignInDiffSection = ({
  signUpDiff,
  signInMethodsDiff,
  socialTargetsDiff,
  isAfter = false,
}: Props) => {
  const showSignUpDiff = isSignUpDifferent(signUpDiff);
  const showSignInDiff = isSignInMethodsDifferent(signInMethodsDiff);
  const showSocialDiff = isSocialTargetsDifferent(socialTargetsDiff);

  return (
    <>
      {showSignUpDiff && <SignUpDiffSection signUpDiff={signUpDiff} isAfter={isAfter} />}
      {showSignInDiff && (
        <SignInDiffSection signInMethodsDiff={signInMethodsDiff} isAfter={isAfter} />
      )}
      {showSocialDiff && (
        <SocialTargetsDiffSection socialTargetsDiff={socialTargetsDiff} isAfter={isAfter} />
      )}
    </>
  );
};

export default SignUpAndSignInDiffSection;
