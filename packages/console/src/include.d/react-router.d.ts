declare module 'react-router-dom' {
  import * as ReactRouterDom from 'node_modules/react-router-dom';
  import type * as Types from 'node_modules/react-router-dom';

  export type {
    Hash,
    Location,
    Path,
    To,
    LinkProps,
    MemoryRouterProps,
    NavigateFunction,
    NavigateOptions,
    NavigateProps,
    Navigator,
    OutletProps,
    Params,
    PathMatch,
    RouteMatch,
    RouteObject,
    RouteProps,
    PathRouteProps,
    LayoutRouteProps,
    IndexRouteProps,
    RouterProps,
    Pathname,
    Search,
    RoutesProps,
  } from 'node_modules/react-router-dom';

  declare const { useLocation, ...rest } = ReactRouterDom;
  /**
   * An entry in a history stack. A location contains information about the
   * URL path, as well as possibly some arbitrary state and a key.
   */
  interface Location extends Types.Path {
    /**
     * A value of arbitrary data associated with this location.
     */
    state: unknown;
    /**
     * A unique string associated with this location. May be used to safely store
     * and retrieve data in some other storage API, like `localStorage`.
     *
     * Note: This value is always "default" on the initial location.
     */
    key: string;
  }

  declare function newUseLocationFunction(): Location;
  declare const defaultExports = { ...rest, useLocation: newUseLocationFunction };

  export = defaultExports;
}
