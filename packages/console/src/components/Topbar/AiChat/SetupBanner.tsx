import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import CopyIcon from '@/assets/icons/copy.svg?react';

import styles from './index.module.scss';

const mcpSetupPrompt = `Set up the MeshX MCP portal in my MCP client. Ask me for the portal URL (https://<portal-hostname>/mcp), then add it to my client configuration as an MCP server using \`npx -y mcp-remote@latest <portal-url>\`, restart the client, and confirm the portal's servers are listed.`;

type Props = {
  readonly icon: ReactNode;
};

function SetupBanner({ icon }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
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

  return (
    <button
      type="button"
      className={styles.setupBanner}
      onClick={() => {
        void copySetupPrompt();
      }}
    >
      <span>
        {isSetupCopied ? t('inkeep_ai_bot.setup_prompt_copied') : t('inkeep_ai_bot.onboard_agent')}
      </span>
      <span aria-hidden className={styles.setupBannerIcons}>
        {icon}
        <CopyIcon />
      </span>
    </button>
  );
}

export default SetupBanner;
