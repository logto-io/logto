import type { SignInExperience } from '@logto/schemas';

import SignInDiffSection from './SignInDiffSection';
import SignUpDiffSection from './SignUpDiffSection';
import SocialTargetsDiffSection from './SocialTargetsDiffSection';
import { isSignInMethodsDifferent, isSignUpDifferent, isSocialTargetsDifferent } from './utilities';

type Props = {
  before: SignInExperience;
  after: SignInExperience;
  isAfter?: boolean;
};

const SignUpAndSignInDiffSection = ({ before, after, isAfter = false }: Props) => {
  const showSignUpDiff = isSignUpDifferent(before.signUp, after.signUp);
  const showSignInDiff = isSignInMethodsDifferent(before.signIn.methods, after.signIn.methods);
  const showSocialDiff = isSocialTargetsDifferent(
    before.socialSignInConnectorTargets,
    after.socialSignInConnectorTargets
  );

  return (
    <>
      {showSignUpDiff && (
        <SignUpDiffSection before={before.signUp} after={after.signUp} isAfter={isAfter} />
      )}
      {showSignInDiff && (
        <SignInDiffSection
          before={before.signIn.methods}
          after={after.signIn.methods}
          isAfter={isAfter}
        />
      )}
      {showSocialDiff && (
        <SocialTargetsDiffSection
          before={before.socialSignInConnectorTargets}
          after={after.socialSignInConnectorTargets}
          isAfter={isAfter}
        />
      )}
    </>
  );
};

export default SignUpAndSignInDiffSection;
