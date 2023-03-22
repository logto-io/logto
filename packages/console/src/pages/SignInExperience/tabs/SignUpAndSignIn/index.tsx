import TabWrapper from '../../components/TabWrapper';
import * as styles from '../index.module.scss';
import SignInForm from './SignInForm';
import SignUpForm from './SignUpForm';
import SocialSignInForm from './SocialSignInForm';

type Props = {
  isActive: boolean;
};

function SignUpAndSignIn({ isActive }: Props) {
  return (
    <TabWrapper isActive={isActive} className={styles.tabContent}>
      <SignUpForm />
      <SignInForm />
      <SocialSignInForm />
    </TabWrapper>
  );
}

export default SignUpAndSignIn;
