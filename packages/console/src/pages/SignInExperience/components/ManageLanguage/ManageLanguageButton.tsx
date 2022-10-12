import { useState } from 'react';

import Button from '@/components/Button';

import LanguageEditor from './LanguageEditor';

const ManageLanguageButton = () => {
  const [isLanguageEditorOpen, setIsLanguageEditorOpen] = useState(false);

  return (
    <>
      <Button
        type="plain"
        title="sign_in_exp.others.languages.manage_language"
        onClick={() => {
          setIsLanguageEditorOpen(true);
        }}
      />
      <LanguageEditor
        isOpen={isLanguageEditorOpen}
        onClose={() => {
          setIsLanguageEditorOpen(false);
        }}
      />
    </>
  );
};

export default ManageLanguageButton;
