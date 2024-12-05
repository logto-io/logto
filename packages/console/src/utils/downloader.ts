export const downloadText = (
  text: string,
  filename: string,
  type: BlobPropertyBag['type'] = 'text/plain'
) => {
  const blob = new Blob([text], { type });
  const downloadLink = document.createElement('a');
  // eslint-disable-next-line @silverhand/fp/no-mutation
  downloadLink.href = URL.createObjectURL(blob);
  // eslint-disable-next-line @silverhand/fp/no-mutation
  downloadLink.download = filename;
  downloadLink.click();
  downloadLink.remove();
  window.URL.revokeObjectURL(downloadLink.href);
};
