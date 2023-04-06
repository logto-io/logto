// Cannot import from "@silverhand/essentials" in this file.
// See https://www.karltarvas.com/2021/03/11/typescript-array-filter-boolean.html

type Falsy = false | 0 | '' | undefined | undefined;

interface Array<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: unknown): Array<Exclude<S, Falsy>>;
}

interface ReadonlyArray<T> {
  filter<S extends T>(predicate: BooleanConstructor, thisArg?: unknown): Array<Exclude<S, Falsy>>;
}
