import { type InkeepSettings } from '@inkeep/cxkit-react';
import { useMemo } from 'react';

import logtoAiBotDark from '@/assets/icons/logto-ai-bot-dark.svg?url';
import logtoAiBot from '@/assets/icons/logto-ai-bot.svg?url';
import { inkeepApiKey } from '@/consts/env';

import useTheme from './use-theme';

const customStyles = `
.ikp-ai-chat-tagline__container,
.ikp-ai-search-tagline__container {
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
}`;

const useInkeepConfigs = () => {
  const theme = useTheme();

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
            styles: [
              {
                key: 'custom-styles',
                type: 'style',
                value: customStyles,
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
          exampleQuestions: [
            'Quickstart guide for Logto setup',
            'Configure multi-tenancy architecture',
            'How to integrate user profile?',
          ],
          disclaimerSettings: {
            isEnabled: true,
            label: 'Logto AI disclaimer',
            tooltip: 'Responses are AI-generated and may require verification.',
          },
          toolbarButtonLabels: {
            clear: 'Start Over',
            stop: 'Stop',
            copyChat: 'Copy Chat',
            getHelp: 'Get Help',
          },
          getHelpOptions: [
            {
              icon: { builtIn: 'IoChatbubblesOutline' },
              name: 'Contact',
              action: {
                type: 'open_link',
                url: 'https://logto.io/contact',
              },
            },
            {
              icon: { builtIn: 'FaDiscord' },
              name: 'Discord',
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
    [theme]
  );
};

export default useInkeepConfigs;
