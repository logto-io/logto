import type { ZodError } from 'zod';

export const formatZodError = ({ issues }: ZodError): string[] =>
  issues.map((issue) => {
    const base = `Error in key path "${issue.path.map(String).join('.')}": (${issue.code}) `;

    if (issue.code === 'invalid_type') {
      return base + `Expected ${issue.expected} but received ${issue.received}.`;
    }

    return base + issue.message;
  });
