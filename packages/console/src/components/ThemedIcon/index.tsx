import styles from './index.module.scss';

type Props = {
  readonly for: SvgComponent;
  readonly size?: number;
};

/**
 * Renders an icon with color according to the current theme. It uses `--color-specific-icon-bg`
 * CSS variable to determine the color.
 */
function ThemedIcon({ for: Icon, size }: Props) {
  return <Icon className={styles.icon} style={{ width: size, height: size }} />;
}

export default ThemedIcon;
