import Button from '@/ds-components/Button';

type Props = {
  readonly isCreateButtonDisabled: boolean;
  readonly onClickCreateButton: () => void;
};

function Footer({ isCreateButtonDisabled, onClickCreateButton }: Props) {
  return (
    <Button
      title="general.next"
      type="primary"
      disabled={isCreateButtonDisabled}
      onClick={onClickCreateButton}
    />
  );
}

export default Footer;
