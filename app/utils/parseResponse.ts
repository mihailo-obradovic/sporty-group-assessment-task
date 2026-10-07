import type { z } from 'zod';

export class ResponseShapeError extends Error {
  override name = 'ResponseShapeError';
}

export function parseResponse<TSchema extends z.ZodType>(
  schema: TSchema,
  data: unknown
): z.output<TSchema> {
  const result = schema.safeParse(data);

  if (!result.success) {
    console.error(
      '[parseResponse] response did not match its schema',
      result.error.issues
    );
    throw new ResponseShapeError('Unexpected response from the server.');
  }

  return result.data;
}
