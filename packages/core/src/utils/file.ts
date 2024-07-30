/**
 * Read a Readable stream to a string
 * @param stream - The Readable stream to read from
 * @returns A promise that resolves to a string containing the stream's data
 */
export async function streamToString(stream?: NodeJS.ReadableStream): Promise<string> {
  if (!stream) {
    return '';
  }
  const chunks: Uint8Array[] = [];
  for await (const chunk of stream) {
    // eslint-disable-next-line @silverhand/fp/no-mutating-methods
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  const buffer = Buffer.concat(chunks);
  return buffer.toString('utf8');
}
