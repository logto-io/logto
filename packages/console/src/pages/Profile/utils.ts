export type LocationState = {
  email: string;
  action: 'changePassword' | 'changeEmail';
};

export const checkLocationState = (state: unknown): state is LocationState =>
  typeof state === 'object' &&
  state !== null &&
  'email' in state &&
  'action' in state &&
  typeof state.email === 'string' &&
  typeof state.action === 'string' &&
  ['changePassword', 'changeEmail'].includes(state.action);
