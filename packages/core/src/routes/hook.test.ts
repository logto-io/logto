import type { Hook, CreateHook, HookConfig } from '@logto/schemas';
import { HookEventType } from '@logto/schemas';

import { mockHook } from '@/__mocks__';
import { createRequester } from '@/utils/test-utils';

import hookRoutes from './hook';

jest.mock('@/queries/hook', () => ({
  findTotalNumberOfHooks: jest.fn(async () => ({ count: 10 })),
  findAllHooks: jest.fn(async (): Promise<Hook[]> => [mockHook]),
  findHookById: jest.fn(async (): Promise<Hook> => mockHook),
  insertHook: jest.fn(
    async (body: CreateHook): Promise<Hook> => ({
      ...mockHook,
      ...body,
    })
  ),
  updateHookById: jest.fn(
    async (_, data: Partial<CreateHook>): Promise<Hook> => ({
      ...mockHook,
      ...data,
      config: { ...mockHook.config, ...data.config },
    })
  ),
  deleteHookById: jest.fn(),
}));

jest.mock('@logto/shared', () => ({
  generateStandardId: jest.fn(() => mockHook.id),
}));

describe('hook routes', () => {
  const hookRequest = createRequester({ authedRoutes: hookRoutes });

  it('GET /hooks', async () => {
    const response = await hookRequest.get('/hooks');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockHook]);
    expect(response.header).toHaveProperty('total-number', '10');
  });

  it('POST /hooks', async () => {
    const event = HookEventType.PostChangePassword;

    const response = await hookRequest.post('/hooks').send({ event, config: mockHook.config });

    console.log();

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockHook,
      event,
    });
  });

  it('POST /hooks should throw with invalid input body', async () => {
    const id = 'a_good_hook';
    const event = HookEventType.PostChangePassword;

    await expect(hookRequest.post('/hooks')).resolves.toHaveProperty('status', 400);
    await expect(hookRequest.post('/hooks').send({ id })).resolves.toHaveProperty('status', 400);
    await expect(hookRequest.post('/hooks').send({ event })).resolves.toHaveProperty('status', 400);
  });

  it('GET /hooks/:id', async () => {
    const response = await hookRequest.get('/hooks/foo');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockHook);
  });

  it('PATCH /hooks/:id', async () => {
    const event = HookEventType.PostChangePassword;
    const config: Partial<HookConfig> = { url: 'https://bar.baz' };

    const response = await hookRequest.patch('/hooks/foo').send({ event, config });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockHook,
      event,
      config: { ...mockHook.config, url: config.url },
    });
  });

  it('PATCH /hooks/:id should throw with invalid properties', async () => {
    const response = await hookRequest.patch('/hooks/foo').send({ event: 12 });
    expect(response.status).toEqual(400);
  });

  it('DELETE /hooks/:id', async () => {
    await expect(hookRequest.delete('/hooks/foo')).resolves.toHaveProperty('status', 204);
  });
});
