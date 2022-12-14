/** Mode for matching the given value(s) and database entries. */
export enum SearchMatchMode {
  /** Use `=` or in-array checking. */
  Exact = 'exact',
  /** Use the keyword `LIKE`. See [Postgres docs](https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-LIKE). */
  Like = 'like',
  /** Use the keyword `SIMILAR TO` for regular expression matching. See [Postgres docs](https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-SIMILARTO-REGEXP). */
  SimilarTo = 'similar_to',
  /** Use the keyword `POSIX` for regular expression matching. See [Postgres docs](https://www.postgresql.org/docs/current/functions-matching.html#FUNCTIONS-POSIX-REGEXP). */
  Posix = 'posix',
}

/** Mode for joining multiple expressions when searching. */
export enum SearchJointMode {
  Or = 'or',
  And = 'and',
}
