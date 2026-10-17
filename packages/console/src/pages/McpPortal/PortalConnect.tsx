import { useState } from 'react';

import FormCard from '@/components/FormCard';
import Button from '@/ds-components/Button';
import DangerousRaw from '@/ds-components/DangerousRaw';

import styles from './index.module.scss';
import { type Portal } from './types';

/** The URL and MCP client config for a portal, plus the prompt an agent can be given to set it up. */
const getPortalSetup = (portal: Portal) => {
  const url = `https://${portal.hostname}/mcp`;
  const config = JSON.stringify(
    {
      mcpServers: {
        [portal.name.toLowerCase().replaceAll(/[^\da-z]+/g, '-') || 'portal']: {
          command: 'npx',
          args: ['-y', 'mcp-remote@latest', url],
        },
      },
    },
    null,
    2
  );

  const setupPrompt = `Add this MCP portal to my MCP client configuration. Use the config below, then restart the client and confirm the portal's servers are listed.\n\nPortal URL: ${url}\n\n${config}`;

  return { url, config, setupPrompt };
};

/** How people connect their agents to this portal. The URL is the only thing they need to paste. */
function PortalConnect({ portal }: { readonly portal: Portal }) {
  const [copied, setCopied] = useState<'url' | 'config' | 'prompt'>();
  const { url, config } = getPortalSetup(portal);

  const copy = async (value: string, which: 'url' | 'config' | 'prompt') => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(which);
    } catch {
      // Clipboard access can be refused; the text stays selectable on screen.
      setCopied(undefined);
    }
  };

  return (
    <FormCard title={<DangerousRaw>Connect</DangerousRaw>}>
      <p className={styles.description}>
        Give this address to anyone who should use the servers in this portal. They sign in once,
        and their organization decides whether they get in.
      </p>
      <div className={styles.copyRow}>
        <code className={styles.code}>{url}</code>
        <Button
          type="outline"
          size="small"
          title={<DangerousRaw>{copied === 'url' ? 'Copied' : 'Copy'}</DangerousRaw>}
          onClick={() => {
            void copy(url, 'url');
          }}
        />
      </div>
      <p className={styles.muted}>Or add this to an MCP client config:</p>
      <pre className={styles.code}>{config}</pre>
      <Button
        type="outline"
        title={<DangerousRaw>{copied === 'config' ? 'Copied' : 'Copy config'}</DangerousRaw>}
        onClick={() => {
          void copy(config, 'config');
        }}
      />
    </FormCard>
  );
}

/** Pill banner at the top of the portal page: one click copies a setup prompt for an agent. */
export function SetupBanner({ portal }: { readonly portal: Portal }) {
  const [copied, setCopied] = useState(false);
  const { setupPrompt } = getPortalSetup(portal);

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(setupPrompt);
      setCopied(true);
    } catch {
      // Clipboard access can be refused; the Connect card below still shows the config.
      setCopied(false);
    }
  };

  return (
    <div className={styles.banner}>
      <span>Onboard your agent to this portal</span>
      <Button
        type="primary"
        size="small"
        title={<DangerousRaw>{copied ? 'Copied' : 'Copy setup prompt'}</DangerousRaw>}
        onClick={() => {
          void copyPrompt();
        }}
      />
    </div>
  );
}

export default PortalConnect;
