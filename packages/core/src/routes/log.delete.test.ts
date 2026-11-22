import { createLogTestContext } from './log.test-utils.js';

const { jest } = import.meta;
const { logs, logRequest } = await createLogTestContext();
const { deleteLogsInRange } = logs;

afterEach(() => {
  jest.clearAllMocks();
});

describe('DELETE /logs', () => {
  it('deletes within the window and returns the summary', async () => {
    deleteLogsInRange.mockResolvedValueOnce({
      deletedCount: 2,
      deletedRange: { oldest: 1000, newest: 2000 },
    });

    const response = await logRequest.delete('/logs?end_time=5000&start_time=500&limit=10');

    expect(response.status).toEqual(200);
    expect(deleteLogsInRange).toHaveBeenCalledWith(
      expect.objectContaining({ endTime: 5000, startTime: 500, limit: 10 })
    );
    expect(response.body).toEqual({
      deletedCount: 2,
      hasMore: false,
      deletedRange: { oldest: 1000, newest: 2000 },
    });
  });

  it('passes the window through without a key filter', async () => {
    await logRequest.delete('/logs?end_time=5000');

    const [condition] = deleteLogsInRange.mock.calls[0] as [Record<string, unknown>];

    // Webhook delivery logs share the `logs` table and are intentionally in scope here: adding
    // a key filter would keep the statement off the time index and make each batch of a purge
    // loop more expensive than the last.
    expect(condition).not.toHaveProperty('includeKeyPrefix');
  });

  it('defaults limit to 1000 and passes startTime as undefined when omitted', async () => {
    const response = await logRequest.delete('/logs?end_time=5000');

    expect(response.status).toEqual(200);
    expect(deleteLogsInRange).toHaveBeenCalledWith(
      expect.objectContaining({ endTime: 5000, startTime: undefined, limit: 1000 })
    );
  });

  it.each([
    ['minimum', '1', 1],
    ['maximum', '10000', 10_000],
  ])('accepts the %s limit of %s', async (_name, rawLimit, limit) => {
    const response = await logRequest.delete(`/logs?end_time=5000&limit=${rawLimit}`);

    expect(response.status).toEqual(200);
    expect(deleteLogsInRange).toHaveBeenCalledWith(expect.objectContaining({ limit }));
  });

  it('accepts end_time=0 (the unix epoch) rather than treating it as absent', async () => {
    const response = await logRequest.delete('/logs?end_time=0');

    expect(response.status).toEqual(200);
    expect(deleteLogsInRange).toHaveBeenCalledWith(expect.objectContaining({ endTime: 0 }));
  });

  it('accepts start_time=0 rather than dropping the lower bound', async () => {
    const response = await logRequest.delete('/logs?end_time=5000&start_time=0');

    expect(response.status).toEqual(200);
    expect(deleteLogsInRange).toHaveBeenCalledWith(
      expect.objectContaining({ endTime: 5000, startTime: 0 })
    );
  });

  it('reports hasMore=true when the batch was full', async () => {
    deleteLogsInRange.mockResolvedValueOnce({ deletedCount: 10 });

    const response = await logRequest.delete('/logs?end_time=5000&limit=10');

    expect(response.body).toEqual({ deletedCount: 10, hasMore: true });
  });

  it('omits deletedRange when nothing was deleted', async () => {
    const response = await logRequest.delete('/logs?end_time=5000');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ deletedCount: 0, hasMore: false });
  });

  it('returns 400 when end_time is missing', async () => {
    const response = await logRequest.delete('/logs');

    expect(response.status).toEqual(400);
    expect(deleteLogsInRange).not.toHaveBeenCalled();
  });

  it('returns 400 when end_time is in the future', async () => {
    const response = await logRequest.delete(`/logs?end_time=${Date.now() + 3_600_000}`);

    expect(response.status).toEqual(400);
    expect(response.body.code).toBe('log.cleanup_boundary_in_future');
    expect(deleteLogsInRange).not.toHaveBeenCalled();
  });

  it('returns 400 when start_time is after end_time', async () => {
    const inverted = await logRequest.delete('/logs?end_time=5000&start_time=6000');

    expect(inverted.status).toEqual(400);
    expect(inverted.body.code).toBe('log.invalid_time_window');
    expect(deleteLogsInRange).not.toHaveBeenCalled();
  });

  it.each([
    ['empty end_time', 'end_time='],
    ['whitespace end_time', 'end_time=%20%20'],
    ['empty start_time', 'end_time=5000&start_time='],
    ['negative end_time', 'end_time=-1'],
    ['end_time beyond the safe integer range', 'end_time=1e16'],
    ['non-finite end_time', 'end_time=abc'],
    ['non-finite start_time', 'end_time=5000&start_time=abc'],
  ])('returns 400 for %s instead of coercing it', async (_name, queryString) => {
    const response = await logRequest.delete(`/logs?${queryString}`);

    expect(response.status).toEqual(400);
    expect(response.body.code).toBe('guard.invalid_input');
    expect(deleteLogsInRange).not.toHaveBeenCalled();
  });

  it.each([
    ['zero', '0'],
    ['above the cap', '10001'],
    ['fractional', '1.5'],
    ['not a number', 'abc'],
  ])('returns 400 when limit is %s', async (_name, limit) => {
    const response = await logRequest.delete(`/logs?end_time=5000&limit=${limit}`);

    expect(response.status).toEqual(400);
    expect(deleteLogsInRange).not.toHaveBeenCalled();
  });
});
