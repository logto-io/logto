import SecondaryPageWrapper from '@/components/SecondaryPageWrapper';
import ResetPasswordForm from '@/containers/ResetPassword';

const ResetPassword = () => {
  return (
    <SecondaryPageWrapper title="description.new_password">
      {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
      <ResetPasswordForm autoFocus />
    </SecondaryPageWrapper>
  );
};

export default ResetPassword;
