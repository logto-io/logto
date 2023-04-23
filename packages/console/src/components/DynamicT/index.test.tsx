import { render } from '@testing-library/react';
import { t, type TFuncKey, type TypeOptions } from 'i18next';

import DynamicT from '.';

describe('<DynamicT />', () => {
  it('should render a correct key', () => {
    const key: TFuncKey<TypeOptions['defaultNS'], 'admin_console'> = 'general.add';
    const { container } = render(<DynamicT forKey={key} />);

    expect(container.innerHTML).toBe(t(`admin_console.${key}`));
  });

  it('should render an error message for a non-leaf key', () => {
    const key: TFuncKey<TypeOptions['defaultNS'], 'admin_console'> = 'general';
    const { container } = render(<DynamicT forKey={key} />);

    expect(container.innerHTML).toBe(
      `key 'admin_console.${key} (en)' returned an object instead of string.`
    );
  });
});
