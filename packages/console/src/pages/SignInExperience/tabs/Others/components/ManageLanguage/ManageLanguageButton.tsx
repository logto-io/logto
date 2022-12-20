import { useNavigate } from 'react-router-dom';

import Button from '@/components/Button';
import useModalControl from '@/hooks/use-modal-control';

import LanguageEditor from './LanguageEditor';

type Props = {
  className?: string;
};

const ManageLanguageButton = ({ className }: Props) => {
  const { open, isOpen } = useModalControl('manage_language');
  const navigate = useNavigate();

  return (
    <>
      <Button
        type="text"
        size="small"
        title="sign_in_exp.others.languages.manage_language"
        className={className}
        onClick={() => {
          open();
        }}
      />
      <LanguageEditor
        isOpen={isOpen}
        onClose={() => {
          navigate(-1);
        }}
      />
    </>
  );
};

export default ManageLanguageButton;
