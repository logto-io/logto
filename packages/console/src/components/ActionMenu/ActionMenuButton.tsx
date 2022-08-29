import { forwardRef } from 'react';

import Button, { Props as ButtonProps } from '../Button';

const ActionMenuButton = forwardRef<HTMLDivElement, ButtonProps>((props, anchorReference) => (
  <div ref={anchorReference} style={{ display: 'inline-block' }}>
    <Button {...props} />
  </div>
));

export default ActionMenuButton;
