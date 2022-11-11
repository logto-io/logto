import UsernameForm from '../UsernameForm';
import useSetUsername from './use-set-username';

type Props = {
  className?: string;
};

const SetUsername = ({ className }: Props) => {
  const { errorMessage, clearErrorMessage, onSubmit } = useSetUsername();

  return (
    <UsernameForm
      className={className}
      hasTerms={false}
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
      submitText="action.continue"
      onSubmit={onSubmit}
    />
  );
};

export default SetUsername;
