import UsernameForm from '../UsernameForm';
import useUsernameRegister from './use-username-register';

type Props = {
  className?: string;
};

const UsernameRegister = ({ className }: Props) => {
  const { errorMessage, clearErrorMessage, onSubmit } = useUsernameRegister();

  return (
    <UsernameForm
      className={className}
      errorMessage={errorMessage}
      clearErrorMessage={clearErrorMessage}
      onSubmit={onSubmit}
    />
  );
};

export default UsernameRegister;
