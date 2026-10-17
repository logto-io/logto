import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import Modal from 'react-modal';
import remarkGfm from 'remark-gfm';

import ArrowUpIcon from '@/assets/icons/arrow-up.svg?react';
import CopyIcon from '@/assets/icons/copy.svg?react';
import AskAiIconDark from '@/assets/icons/logto-ai-bot-dark.svg?react';
import AskAiIcon from '@/assets/icons/logto-ai-bot.svg?react';
import SearchIcon from '@/assets/icons/search.svg?react';
import Button from '@/ds-components/Button';
import useApi from '@/hooks/use-api';
import useTheme from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utils/a11y';

// Without this, the markdown renderer can crash in the parcel dev build. See components/Markdown.
// eslint-disable-next-line import/no-unassigned-import -- Side-effect import works around a parcel dev-build crash.
import 'property-information';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

type ChatMessage = {
  readonly role: 'user' | 'assistant';
  readonly content: string;
};

type ChatResponse = {
  readonly content?: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  // Focus the input when the modal opens, so the user can type straight away.
  useEffect(() => {
    if (isModalOpen) {
      inputRef.current?.focus();
    }
  }, [isModalOpen]);
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

  const sendMessage = async (question?: string) => {
    const content = (question ?? input).trim();

    if (!content || isLoading) {
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content }];

    setMessages(nextMessages);
    setInput('');
    setHasError(false);
    setIsLoading(true);

    try {
      const response = await api
        .post('api/ai-chat/completions', { json: { messages: nextMessages } })
        .json<ChatResponse>();

      setMessages([...nextMessages, { role: 'assistant', content: response.content ?? '' }]);
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    void sendMessage();
  };

  const startOver = () => {
    setMessages([]);
    setInput('');
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

  const mcpSetupPrompt = `Set up the MeshX MCP portal in my MCP client. Ask me for the portal URL (https://<portal-hostname>/mcp), then add it to my client configuration as an MCP server using \`npx -y mcp-remote@latest <portal-url>\`, restart the client, and confirm the portal's servers are listed.`;
  const [isSetupCopied, setIsSetupCopied] = useState(false);

  const copySetupPrompt = async () => {
    try {
      await navigator.clipboard.writeText(mcpSetupPrompt);
      setIsSetupCopied(true);
    } catch {
      // Clipboard access can be blocked by the browser. The button simply stays unchanged.
      setIsSetupCopied(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const renderBubble = (role: ChatMessage['role'], content: string) => (
    <div className={classNames(styles.row, role === 'user' && styles.userRow)}>
      {role === 'assistant' && <div className={styles.avatar}>{Icon}</div>}
      <div
        className={classNames(
          styles.bubble,
          role === 'user' ? styles.userBubble : styles.assistantBubble
        )}
      >
        {role === 'assistant' ? (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {children}
                </a>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        ) : (
          content
        )}
      </div>
    </div>
  );

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
        className={styles.modal}
        overlayClassName={styles.overlay}
        onRequestClose={closeModal}
      >
        <button
          type="button"
          className={styles.setupBanner}
          onClick={() => {
            void copySetupPrompt();
          }}
        >
          <span>{isSetupCopied ? 'Setup prompt copied' : 'Onboard your agent to MeshX'}</span>
          <span aria-hidden className={styles.setupBannerIcons}>
            {Icon}
            <CopyIcon />
          </span>
        </button>
        <form className={styles.inputForm} onSubmit={handleSubmit}>
          <SearchIcon aria-hidden className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            placeholder={t('inkeep_ai_bot.chat_placeholder')}
            aria-label={t('inkeep_ai_bot.chat_placeholder')}
            disabled={isLoading}
            onChange={(event) => {
              setInput(event.currentTarget.value);
            }}
          />
          <button
            type="submit"
            className={styles.sendButton}
            aria-label={t('inkeep_ai_bot.send')}
            disabled={!input.trim() || isLoading}
          >
            <ArrowUpIcon />
          </button>
        </form>
        <div className={styles.messages}>
          {renderBubble('assistant', t('inkeep_ai_bot.intro_message'))}
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
            <div key={index}>{renderBubble(message.role, message.content)}</div>
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
