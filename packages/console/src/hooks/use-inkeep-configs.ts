import { type InkeepSettings } from '@inkeep/cxkit-react';
import { themes } from 'prism-react-renderer';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import logtoAiBotDark from '@/assets/icons/logto-ai-bot-dark.svg?url';
import logtoAiBot from '@/assets/icons/logto-ai-bot.svg?url';
import { inkeepApiKey } from '@/consts/env';

import useTheme from './use-theme';

const customStyles = `
.ikp-ai-chat-tagline__container {
  position: relative;
  color: var(--color-neutral-variant-80);

  > * {
    color: var(--color-neutral-variant-80) !important;
  }

  &:before {
    content: '&';
    position: absolute;
    margin-left: 160px;
    font: var(--font-body-2);
    color: inherit;
  }

  &:after {
    content: '';
    position: absolute;
    margin-left: 178px;
    width: 60px;
    height: 20px;
    background: var(--inkeep-logto-icon) center/60px 20px no-repeat;
  }
}
.ikp-codeblock-header {
  background-color: var(--ikp-color-gray-dark-800);

  .ikp-codeblock-header-language {
    color: var(--ikp-color-gray-400);
  }

  .ikp-codeblock-copy-button {
    color: var(--ikp-color-white-alpha-700);
    
    &:hover {
      color: var(--ikp-color-white-alpha-950);
    }
  }
}
.ikp-codeblock-highlighter {
  background-color: var(--ikp-color-gray-dark-900);
}
`;

const customRtlStyles = `
.ikp-modal__content {
  direction: rtl;

  .ikp-ai-chat-message-header {
    padding-inline: 0.75rem 1.5rem;
  }

  .ikp-ai-chat-message-content-wrapper {
    padding-inline-end: 0.75rem;
    text-align: right;
  }

  .ikp-ai-chat-disclaimer {
    margin-inline: auto 0;
  }

  .ikp-ai-chat-input {
    margin-inline: 0.25rem 0.5rem;
  }

  .ikp-ai-chat-input__send-button {
    transform: scaleX(-1);
  }

  .ikp-ai-chat-tagline__container {
    direction: ltr;
    left: -84px;
  }
}

.ikp-ai-chat-message-sources {
  direction: ltr;
  text-align: left;
}
`;

const useInkeepConfigs = () => {
  const theme = useTheme();
  const { t, i18n } = useTranslation(undefined, { keyPrefix: 'admin_console.inkeep_ai_bot' });
  const isRtl = i18n.dir() === 'rtl';

  return useMemo(
    (): InkeepSettings =>
      ({
        baseSettings: {
          apiKey: inkeepApiKey,
          primaryBrandColor: theme === 'dark' ? '#7958ff' : '#5d34f2',
          organizationDisplayName: 'Logto',
          colorMode: {
            sync: {
              target: document.documentElement,
              attributes: ['data-theme'],
              isDarkMode: (attributes) => attributes['data-theme'] === 'dark',
            },
          },
          theme: {
            syntaxHighlighter: {
              lightTheme: themes.dracula,
              darkTheme: themes.dracula,
            },
            styles: [
              {
                key: 'custom-styles',
                type: 'style',
                value: customStyles,
              },
              {
                key: 'custom-rtl-styles',
                type: 'style',
                value: isRtl ? customRtlStyles : '',
              },
            ],
          },
          transformSource: (source) => {
            const urlConfig = {
              'docs.logto.io': 'Docs',
              'blog.logto.io': 'Blogs',
              'openapi.logto.io': 'APIs',
              'auth-wiki.logto.io': 'Auth Wiki',
              'logto.io': 'Websites',
            } as const;

            const tab = Object.entries(urlConfig).find(([pattern]) =>
              source.url.includes(pattern)
            )?.[1];

            if (!tab) {
              return source;
            }

            return {
              ...source,
              tabs: [...(source.tabs ?? []), tab],
            };
          },
        },
        aiChatSettings: {
          aiAssistantAvatar: theme === 'dark' ? logtoAiBotDark : logtoAiBot,
          aiAssistantName: 'Logto AI',
          introMessage: t('intro_message'),
          exampleQuestionsLabel: t('example_questions_label'),
          exampleQuestions: t('example_questions', { returnObjects: true }),
          disclaimerSettings: {
            isEnabled: true,
            label: t('disclaimer_label'),
            tooltip: t('disclaimer_tooltip'),
          },
          placeholder: t('chat_placeholder'),
          toolbarButtonLabels: {
            clear: t('clear'),
            stop: t('stop'),
            copyChat: t('copy_chat'),
            getHelp: t('get_help'),
          },
          getHelpOptions: [
            {
              icon: { builtIn: 'IoChatbubblesOutline' },
              name: t('contact'),
              action: {
                type: 'open_link',
                url: 'https://logto.io/contact',
              },
            },
            {
              icon: { builtIn: 'FaDiscord' },
              name: t('discord'),
              action: {
                type: 'open_link',
                url: 'https://discord.com/invite/UEPaF3j5e6',
              },
            },
            {
              icon: { builtIn: 'FaGithub' },
              name: 'GitHub',
              action: {
                type: 'open_link',
                url: 'https://github.com/logto-io/logto/issues/new/choose',
              },
            },
          ],
        },
        searchSettings: {
          debounceTimeMs: 300,
          tabs: [
            ['Docs', { isAlwaysVisible: true }],
            'APIs',
            'GitHub',
            'Blogs',
            'Auth Wiki',
            'Websites',
            'All',
          ],
        },
      }) satisfies InkeepSettings,
    [theme, t]
  );
};

export default useInkeepConfigs;
