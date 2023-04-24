import { render } from '@testing-library/react';
import { t, type TFuncKey } from 'i18next';

import DynamicT from '.';

describe('<DynamicT />', () => {
  it('should render empty string when no key passed', () => {
    const { container } = render(<DynamicT />);

    expect(container.innerHTML).toBe('');
  });

  it('should render a correct key', () => {
    const key: TFuncKey = 'action.agree';
    const { container } = render(<DynamicT forKey={key} />);

    expect(container.innerHTML).toBe(t(key));
  });

  it('should render an error message for a non-leaf key', () => {
    const key: TFuncKey = 'action';
    const { container } = render(<DynamicT forKey={key} />);

    expect(container.innerHTML).toBe(`key '${key} (en)' returned an object instead of string.`);
  });
});
