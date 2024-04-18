import { useState } from 'react';

import Button from '@/ds-components/Button';

import LanguageEditor from './LanguageEditor';

type Props = {
  readonly className?: string;
};

function ManageLanguageButton({ className }: Props) {
  const [isLanguageEditorOpen, setIsLanguageEditorOpen] = useState(false);

  return (
    <>
      <Button
        type="text"
        size="small"
        title="sign_in_exp.content.languages.manage_language"
        className={className}
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
}

export default ManageLanguageButton;
