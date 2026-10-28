import type { ScopeResponse } from '@logto/schemas';
import { render, screen } from '@testing-library/react';

import SourceScopeItem from '.';

jest.mock('@/scss/modal.module.scss', () => ({}));

const scope = {
  id: 'scope-id',
  name: 'read:customer_support_analytics_dashboard_development',
} as unknown as ScopeResponse;

describe('SourceScopeItem', () => {
  it('exposes the full scope name through the native title', () => {
    render(<SourceScopeItem scope={scope} isSelected={false} onSelect={jest.fn()} />);

    expect(screen.getByTitle(scope.name)).toBeTruthy();
  });
});
