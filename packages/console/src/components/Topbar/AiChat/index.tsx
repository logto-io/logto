import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-modal';

import CopyIcon from '@/assets/icons/copy.svg?react';
import AskAiIconDark from '@/assets/icons/logto-ai-bot-dark.svg?react';
import AskAiIcon from '@/assets/icons/logto-ai-bot.svg?react';
import Button from '@/ds-components/Button';
import useApi from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utils/a11y';

import Composer, { type Attachment } from './Composer';
import MessageBubble from './MessageBubble';
import ProposedActionCard, { type ProposedAction } from './ProposedActionCard';
import SetupBanner from './SetupBanner';
import { readAttachments } from './attachments';
import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

type ChatMessage = {
  readonly role: 'user' | 'assistant';
  readonly content: string;
  readonly actions?: ProposedAction[];
};

type ChatResponse = {
  readonly content?: string;
  readonly actions?: Array<Omit<ProposedAction, 'status'>>;
};

const iconMap = Object.freeze({
  [Theme.Light]: <AskAiIcon />,
  [Theme.Dark]: <AskAiIconDark />,
} satisfies Record<Theme, ReactNode>);

function AiChat({ className }: Props) {
  const theme = useTheme();
  const Icon = iconMap[theme];
  const api = useApi();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [attachmentError, setAttachmentError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // The modal opens as a compact launcher and grows into a full chat once the user types,
  // attaches a file, or has a conversation going.
  const hasContent = Boolean(input.trim()) || attachments.length > 0;
  const isExpanded = messages.length > 0 || isLoading || hasError || hasContent;

  const exampleQuestions = t('inkeep_ai_bot.example_questions', {
    returnObjects: true,
  });

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length, isLoading, hasError]);

  // Cloudflare-style shortcut: ⌘K (Ctrl+K on Windows/Linux) opens the assistant from anywhere.
  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsModalOpen((isOpen) => !isOpen);
      }
    };

    window.addEventListener('keydown', handleShortcut);

    return () => {
      window.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  const addFiles = async (files: File[]) => {
    const { added, rejected } = await readAttachments(files);

    setAttachmentError(
      rejected.length === 0
        ? undefined
        : t('inkeep_ai_bot.attachment_error', { names: rejected.join(', ') })
    );

    setAttachments((current) => [...current, ...added]);
  };

  const sendMessage = async (question?: string) => {
    const typed = (question ?? input).trim();

    if ((!typed && attachments.length === 0) || isLoading) {
      return;
    }

    // File contents travel inside the message, since the chat API only takes text.
    const fileBlocks = attachments.map(
      ({ name, text }) => `${t('inkeep_ai_bot.file_label', { name })}\n\`\`\`\n${text}\n\`\`\``
    );
    const content = [...fileBlocks, typed].filter(Boolean).join('\n\n');
    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }];

    setMessages(nextMessages);
    setInput('');
    setAttachments([]);
    setAttachmentError(undefined);
    setHasError(false);
    setIsLoading(true);

    try {
      const response = await api
        .post('api/ai-chat/completions', {
          // Only role and content go to the server; proposed actions stay on the client.
          json: {
            messages: nextMessages.map(({ role, content: text }) => ({ role, content: text })),
          },
        })
        .json<ChatResponse>();

      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content: response.content ?? '',
          actions: (response.actions ?? []).map((action) => ({ ...action, status: 'pending' })),
        },
      ]);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const patchAction = (messageIndex: number, actionId: string, patch: Partial<ProposedAction>) => {
    setMessages((current) =>
      current.map((message, index) =>
        index === messageIndex
          ? {
              ...message,
              actions: message.actions?.map((action) =>
                action.id === actionId ? { ...action, ...patch } : action
              ),
            }
          : message
      )
    );
  };

  // The server runs the body it stored when the write was proposed, so nothing is sent from here.
  const confirmAction = async (messageIndex: number, actionId: string) => {
    patchAction(messageIndex, actionId, { status: 'running' });

    try {
      await api.post(`api/ai-chat/actions/${actionId}/confirm`).json();
      patchAction(messageIndex, actionId, { status: 'done' });
    } catch {
      patchAction(messageIndex, actionId, {
        status: 'failed',
        message: t('inkeep_ai_bot.action_failed_detail'),
      });
    }
  };

  const cancelAction = async (messageIndex: number, actionId: string) => {
    try {
      await api.post(`api/ai-chat/actions/${actionId}/cancel`).json();
    } catch {
      // If the cancel did not reach the server, the proposal expires on its own.
    }

    patchAction(messageIndex, actionId, { status: 'cancelled' });
  };

  const startOver = () => {
    setMessages([]);
    setInput('');
    setAttachments([]);
    setAttachmentError(undefined);
    setHasError(false);
  };

  const copyChat = async () => {
    const text = messages
      .map(({ role, content }) => `${role === 'user' ? 'You' : 'MeshX AI'}: ${content}`)
      .join('\n\n');

    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard access can be blocked by the browser. The copy button just stays inactive.
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div
        tabIndex={0}
        aria-label={t('inkeep_ai_bot.ask_ai_label')}
        role="button"
        className={classNames(styles.askAiButton, className)}
        onClick={() => {
          setIsModalOpen(true);
        }}
        onKeyDown={onKeyDownHandler(() => {
          setIsModalOpen(true);
        })}
      >
        {Icon}
        {t('inkeep_ai_bot.ask_ai_label')}
        <kbd className={styles.shortcut}>⌘K</kbd>
      </div>
      <Modal
        shouldCloseOnOverlayClick
        isOpen={isModalOpen}
        ariaHideApp={false}
        contentLabel={t('inkeep_ai_bot.ask_ai_label')}
        className={classNames(styles.modal, isExpanded && styles.modalExpanded)}
        overlayClassName={styles.overlay}
        onRequestClose={closeModal}
      >
        <SetupBanner icon={Icon} />
        <div className={styles.messages}>
          <MessageBubble
            sender="assistant"
            content={t('inkeep_ai_bot.intro_message')}
            icon={Icon}
          />
          {messages.length === 0 && Array.isArray(exampleQuestions) && (
            <div className={styles.examples}>
              <div className={styles.examplesLabel}>
                {t('inkeep_ai_bot.example_questions_label')}
              </div>
              {exampleQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  className={styles.exampleQuestion}
                  onClick={() => {
                    void sendMessage(question);
                  }}
                >
                  {question}
                </button>
              ))}
            </div>
          )}
          {messages.map((message, index) => (
            // Messages are only appended, never reordered, so the index is a stable key.
            // eslint-disable-next-line react/no-array-index-key
            <div key={index}>
              <MessageBubble sender={message.role} content={message.content} icon={Icon} />
              {message.actions?.map((action) => (
                <ProposedActionCard
                  key={action.id}
                  action={action}
                  onConfirm={() => {
                    void confirmAction(index, action.id);
                  }}
                  onCancel={() => {
                    void cancelAction(index, action.id);
                  }}
                />
              ))}
            </div>
          ))}
          {isLoading && (
            <div className={styles.row}>
              <div className={styles.avatar}>{Icon}</div>
              <div className={classNames(styles.bubble, styles.assistantBubble)}>
                <span className={styles.typing} aria-label="…">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            </div>
          )}
          {hasError && <div className={styles.error}>{t('inkeep_ai_bot.unavailable')}</div>}
          <div ref={scrollAnchorRef} />
        </div>
        <Composer
          value={input}
          attachments={attachments}
          attachmentError={attachmentError}
          isLoading={isLoading}
          hasContent={hasContent}
          onChange={setInput}
          onSubmit={() => {
            void sendMessage();
          }}
          onFilesSelected={(files) => {
            void addFiles(files);
          }}
          onRemoveAttachment={(id) => {
            setAttachments((current) => current.filter((item) => item.id !== id));
          }}
        />
        <div className={styles.toolbar}>
          <div className={styles.toolbarActions}>
            <Button
              size="small"
              type="text"
              title="inkeep_ai_bot.clear"
              disabled={messages.length === 0 && !hasError}
              onClick={startOver}
            />
            <Button
              size="small"
              type="text"
              title="inkeep_ai_bot.copy_chat"
              icon={<CopyIcon />}
              disabled={messages.length === 0}
              onClick={() => {
                void copyChat();
              }}
            />
          </div>
          <span className={styles.disclaimer} title={t('inkeep_ai_bot.disclaimer_tooltip')}>
            {t('inkeep_ai_bot.disclaimer_label')}
          </span>
        </div>
      </Modal>
    </>
  );
}

export default AiChat;
