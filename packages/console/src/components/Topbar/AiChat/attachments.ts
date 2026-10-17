import { type Attachment } from './Composer';

const maxAttachmentBytes = 100 * 1024;

const textFilePattern = /\.(csv|json|md|ya?ml|txt|sql|sh|ts|tsx|js|jsx)$/i;

const isTextFile = (file: File) =>
  file.type.startsWith('text/') ||
  file.type === 'application/json' ||
  textFilePattern.test(file.name);

/** A file can be attached when it is text and small enough to send in a chat message. */
const isAcceptedAttachment = (file: File) => isTextFile(file) && file.size <= maxAttachmentBytes;

/** Reads the accepted files as text; returns the rejected names so the caller can explain them. */
export const readAttachments = async (
  files: File[]
): Promise<{ added: Attachment[]; rejected: string[] }> => {
  const accepted = files.filter((file) => isAcceptedAttachment(file));
  const rejected = files.filter((file) => !isAcceptedAttachment(file));

  const added = await Promise.all(
    accepted.map(async (file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      text: await file.text(),
    }))
  );

  return { added, rejected: rejected.map(({ name }) => name) };
};
