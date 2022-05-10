const parameters = new Set(process.argv.slice(2));
export const noInquiry = parameters.has('--no-inquiry');
export const fromRoot = parameters.has('--from-root');
export const allYes = parameters.has('--all-yes');
