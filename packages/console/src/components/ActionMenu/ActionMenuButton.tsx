import React, { forwardRef } from 'react';

import Button, { ButtonProps } from '../Button';

const ActionMenuButton = forwardRef<HTMLDivElement, ButtonProps>((props, anchorReference) => (
  <div ref={anchorReference} style={{ display: 'inline-block' }}>
    <Button {...props} />
  </div>
));

export default ActionMenuButton;
