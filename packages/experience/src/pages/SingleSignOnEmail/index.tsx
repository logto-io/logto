import SecondaryPageLayout from '@/Layout/SecondaryPageLayout';
import SingleSignOnForm from '@/components/SingleSignOnForm';

const SingleSignOnEmail = () => {
  return (
    <SecondaryPageLayout
      title="action.single_sign_on"
      description="description.single_sign_on_email_form"
    >
      <SingleSignOnForm />
    </SecondaryPageLayout>
  );
};

export default SingleSignOnEmail;
