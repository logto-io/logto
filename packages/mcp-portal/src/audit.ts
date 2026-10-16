export type AuditEvent = {
  action:
    | 'upstream.add'
    | 'upstream.remove'
    | 'tool.list'
    | 'tool.call'
    | 'portal.setup'
    | 'portal.reset';
  sub: string;
  upstream?: string;
  tool?: string;
  outcome: 'ok' | 'error' | 'denied';
  durationMs?: number;
  reason?: string;
};

/**
 * Writes one JSON line per event to stdout. Callers pass the event; the sink decides where it goes,
 * so tests can capture it.
 */
export type AuditSink = (event: AuditEvent & { time: string }) => void;

export const stdoutAuditSink: AuditSink = (event) => {
  process.stdout.write(`${JSON.stringify({ type: 'mcp_portal_audit', ...event })}\n`);
};

export const createAudit =
  (sink: AuditSink = stdoutAuditSink) =>
  (event: AuditEvent) => {
    sink({ ...event, time: new Date().toISOString() });
  };
