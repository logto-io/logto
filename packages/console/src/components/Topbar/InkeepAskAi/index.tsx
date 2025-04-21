import { InkeepModalChat } from '@inkeep/cxkit-react';
import { Theme } from '@logto/schemas';
import classNames from 'classnames';
import { type ReactNode, useState } from 'react';

import AskAiIconDark from '@/assets/icons/logto-ai-bot-dark.svg?react';
import AskAiIcon from '@/assets/icons/logto-ai-bot.svg?react';
import useInkeepConfigs from '@/hooks/use-inkeep-configs';
import useTheme from '@/hooks/use-theme';
import { onKeyDownHandler } from '@/utils/a11y';

import styles from './index.module.scss';

type Props = {
  readonly className?: string;
};

const iconMap = Object.freeze({
  [Theme.Light]: <AskAiIcon />,
  [Theme.Dark]: <AskAiIconDark />,
} satisfies Record<Theme, ReactNode>);

function InkeepAskAi({ className }: Props) {
  const theme = useTheme();
  const inkeepConfigs = useInkeepConfigs();
  const Icon = iconMap[theme];
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div
        tabIndex={0}
        aria-label="Ask AI"
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
        Ask AI
      </div>
      <InkeepModalChat
        {...inkeepConfigs}
        shouldAutoFocusInput
        modalSettings={{
          isOpen: isModalOpen,
          shortcutKey: null,
          onOpenChange: (isOpen) => {
            setIsModalOpen(isOpen);
          },
        }}
      />
    </>
  );
}

export default InkeepAskAi;
