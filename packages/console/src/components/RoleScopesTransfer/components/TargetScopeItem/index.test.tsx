import type { ScopeResponse } from '@logto/schemas';
import { render, screen } from '@testing-library/react';

import TargetScopeItem from '.';

const scope = {
  id: 'scope-id',
  name: 'read:customer_support_analytics_dashboard_development',
  resource: { name: 'Acme Payments Platform - Development' },
} as unknown as ScopeResponse;

describe('TargetScopeItem', () => {
  it('exposes the full scope and resource names through the native titles', () => {
    render(<TargetScopeItem scope={scope} onDelete={jest.fn()} />);

    expect(screen.getByTitle(scope.name)).toBeTruthy();
    expect(screen.getByTitle(scope.resource.name)).toBeTruthy();
  });
});
