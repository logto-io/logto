import { render, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';

import { AppLogo, AppContext } from '@/__mocks__/logto';

import BrandingHeader from '.';

describe('BrandingHeader UI Component', () => {
  test('render logo with context', () => {
    const { queryByText, container } = render(
      <BrandingHeader logo={AppLogo} context={AppContext} />
    );
    expect(queryByText(AppContext)).not.toBeNull();
    expect(container.querySelector('img')).not.toBeNull();
  });

  test('render logo with error', async () => {
    const { container } = render(<BrandingHeader logo={AppLogo} />);

    const img = container.querySelector('img');
    expect(img).not.toBeNull();

    if (img) {
      fireEvent.error(img);
    }

    await waitFor(() => {
      expect(container.querySelector('img')).toBeNull();
    });
  });
});
