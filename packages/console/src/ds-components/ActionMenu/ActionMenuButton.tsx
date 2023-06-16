import { forwardRef } from 'react';

import type { Props as ButtonProps } from '../Button';
import Button from '../Button';

const ActionMenuButton = forwardRef<HTMLDivElement, ButtonProps>((props, anchorReference) => (
  <div ref={anchorReference} style={{ display: 'inline-block' }}>
    <Button {...props} />
  </div>
));

export default ActionMenuButton;
