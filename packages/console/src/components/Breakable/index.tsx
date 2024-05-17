import * as styles from './index.module.scss';

type Props = {
  readonly children: React.ReactNode;
};

/**
 * A component that can be used to render text that can be broken into multiple lines. It
 * wraps the children with a div and applies `word-break: break-word` and
 * `overflow-wrap: break-word` to it.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/word-break | word-break in MDN}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap | overflow-wrap in MDN}
 */
function Breakable({ children }: Props) {
  return <div className={styles.breakable}>{children}</div>;
}

export default Breakable;
