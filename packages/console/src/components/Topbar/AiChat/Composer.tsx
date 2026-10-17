import { type FormEvent, type KeyboardEvent, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import ArrowUpIcon from '@/assets/icons/arrow-up.svg?react';
import CloseIcon from '@/assets/icons/close.svg?react';
import FileIcon from '@/assets/icons/file.svg?react';
import PlusIcon from '@/assets/icons/plus.svg?react';

import styles from './index.module.scss';

// Attachments are sent as plain text, because the chat API accepts text only.
export type Attachment = {
  readonly id: string;
  readonly name: string;
  readonly text: string;
};

type Props = {
  readonly value: string;
  readonly attachments: Attachment[];
  readonly attachmentError?: string;
  readonly isLoading: boolean;
  readonly hasContent: boolean;
  readonly onChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onFilesSelected: (files: File[]) => void;
  readonly onRemoveAttachment: (id: string) => void;
};

function Composer({
  value,
  attachments,
  attachmentError,
  isLoading,
  hasContent,
  onChange,
  onSubmit,
  onFilesSelected,
  onRemoveAttachment,
}: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The composer mounts when the modal opens, so the user can type straight away.
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    onSubmit();
  };

  // Enter sends, Shift+Enter adds a line. Enter during IME composition only confirms the text.
  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onSubmit();
    }
  };

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      {attachments.length > 0 && (
        <ul className={styles.attachments} aria-label={t('inkeep_ai_bot.attached_files_label')}>
          {attachments.map((attachment) => (
            <li key={attachment.id} className={styles.attachmentChip}>
              <FileIcon aria-hidden className={styles.attachmentIcon} />
              <span className={styles.attachmentName}>{attachment.name}</span>
              <button
                type="button"
                className={styles.attachmentRemove}
                aria-label={t('inkeep_ai_bot.remove_file', { name: attachment.name })}
                onClick={() => {
                  onRemoveAttachment(attachment.id);
                }}
              >
                <CloseIcon aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
      <textarea
        ref={textareaRef}
        rows={1}
        className={styles.input}
        value={value}
        placeholder={t('inkeep_ai_bot.chat_placeholder')}
        aria-label={t('inkeep_ai_bot.chat_placeholder')}
        disabled={isLoading}
        onKeyDown={handleKeyDown}
        onChange={(event) => {
          onChange(event.currentTarget.value);
        }}
      />
      {attachmentError && <div className={styles.error}>{attachmentError}</div>}
      <div className={styles.composerFooter}>
        <button
          type="button"
          className={styles.attachButton}
          aria-label={t('inkeep_ai_bot.attach_file')}
          disabled={isLoading}
          onClick={() => {
            fileInputRef.current?.click();
          }}
        >
          <PlusIcon aria-hidden />
        </button>
        <input
          ref={fileInputRef}
          multiple
          type="file"
          className={styles.fileInput}
          accept=".txt,.md,.csv,.json,.yaml,.yml,.sql,.sh,.ts,.tsx,.js,.jsx,text/*"
          onChange={(event) => {
            onFilesSelected(Array.from(event.currentTarget.files ?? []));
            // Clearing the value lets the same file be picked again; the input holds no state we keep.
            // eslint-disable-next-line @silverhand/fp/no-mutation
            event.currentTarget.value = '';
          }}
        />
        <button
          type="submit"
          className={styles.sendButton}
          aria-label={t('inkeep_ai_bot.send')}
          disabled={!hasContent || isLoading}
        >
          <ArrowUpIcon />
        </button>
      </div>
    </form>
  );
}

export default Composer;
