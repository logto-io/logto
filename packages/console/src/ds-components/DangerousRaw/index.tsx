import type { ReactNode } from 'react';

type Props = {
  readonly children: ReactNode;
};

/**
 * The component to render a raw component when a single translate key is not enough.
 *
 * It is not dangerous for rendering, but it may cause unexpected behavior if the content
 * is intended to be translated.
 */
function DangerousRaw({ children }: Props) {
  return children ? <span>{children}</span> : null;
}

export default DangerousRaw;
