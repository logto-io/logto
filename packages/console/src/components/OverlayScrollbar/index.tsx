import type { OverlayScrollbarsComponentProps } from 'overlayscrollbars-react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';

const OverlayScrollbar = (props: OverlayScrollbarsComponentProps) => (
  <OverlayScrollbarsComponent
    options={{ scrollbars: { autoHide: 'leave', autoHideDelay: 0 } }}
    {...props}
  />
);

export default OverlayScrollbar;
