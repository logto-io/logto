/** The app (either frontend or backend) for a bunch of events. */
export enum Component {
  /** Logto core service. */
  Core = 'core',
  /** Logto Console. */
  Console = 'console',
  /** Logto blog. */
  Blog = 'blog',
  /** Logto official website. */
  Website = 'website',
}

/** General event enums that for frontend apps. */
export enum GeneralEvent {
  /** A user visited the current app, it should be recorded once per session. */
  Visit = 'visit',
}

export enum CoreEvent {
  /** An existing user signed in via an interaction. */
  SignIn = 'sign_in',
  /** A new user has created in an interaction. */
  Register = 'register',
}

export enum ConsoleEvent {
  /** A user started the onboarding process. */
  Onboard = 'onboard',
}

export enum BlogEvent {
  /** A user viewed a blog post. */
  ViewPost = 'view_post',
}

export const eventsMap = Object.freeze({
  [Component.Core]: CoreEvent,
  [Component.Console]: { ...ConsoleEvent, ...GeneralEvent },
  [Component.Blog]: { ...BlogEvent, ...GeneralEvent },
  [Component.Website]: GeneralEvent,
}) satisfies Record<Component, unknown>;

export type EventsMap = typeof eventsMap;

export type EventType<C extends Component> = EventsMap[C][keyof EventsMap[C]];

export function getEventName(
  component: Component.Blog,
  event: EventType<Component.Blog>,
  postUrl?: string
): string;
export function getEventName<C extends Component>(component: C, event: EventType<C>): string;
export function getEventName<C extends Component>(
  component: C,
  event: EventType<C>,
  data?: string
): string {
  return [component, event, data].filter(Boolean).join('/');
}
