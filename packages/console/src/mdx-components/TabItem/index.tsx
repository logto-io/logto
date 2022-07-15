/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { ReactNode } from 'react';

export type Props = {
  children: ReactNode;
  className?: string;
  value: string;
  label?: string;
};

const TabItem = ({ children, ...rest }: Props): JSX.Element => {
  return (
    <div role="tabpanel" {...rest}>
      {children}
    </div>
  );
};

export default TabItem;
