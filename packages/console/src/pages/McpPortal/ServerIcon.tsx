import styles from './index.module.scss';

/**
 * A letter tile for a portal or MCP server, like the application icons. The colour comes from the name,
 * so each one keeps the same icon without loading anything from the server itself.
 */
function ServerIcon({ name }: { readonly name: string }) {
  const hue = [...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % 360;

  return (
    <span
      className={styles.serverIcon}
      style={{ background: `hsl(${hue} 55% 42%)` }}
      aria-hidden="true"
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export default ServerIcon;
