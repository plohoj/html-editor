import { Observable, debounceTime, filter, map, take } from "rxjs";
import { randomFromArray } from "../utils/random-from-array";
import { IAwaitElementOptions } from './await-element';
import { observeQuerySelectorAll } from "./observe-query-selector-all";

/**
 * Awaiting Expects at least one element to match the selector and returns it as an Rx stream.
 * If there are more than 1 elements, it will return a random one.
 * The stream ends after the elements are found / added.
 */
export function awaitRandomElement<T extends Element = Element>(
  options: IAwaitElementOptions<T>,
): Observable<T>;
export function awaitRandomElement<T extends Element = Element>(
  query: string,
  options?: Omit<IAwaitElementOptions<T>, 'query'>,
): Observable<T>;
export function awaitRandomElement<T extends Element = Element>(
  queryOrOptions: string | IAwaitElementOptions<T>,
  options?: Omit<IAwaitElementOptions<T>, 'query'>,
): Observable<T> {
  // #region Options parsing
  let query: string;
  let stableOptions: Omit<IAwaitElementOptions<T>, 'query'>;
  if (typeof queryOrOptions === 'string') {
    query = queryOrOptions;
    stableOptions = options || {};
  } else {
    stableOptions = queryOrOptions;
    query = queryOrOptions.query;
  }
  // #endregion

  return observeQuerySelectorAll<T>(query, stableOptions).pipe(
    debounceTime(stableOptions.debounceTime || 0, stableOptions.debounceScheduler),
    filter(changes => changes.target.length > 0),
    map(changes => randomFromArray(changes.target)),
    take(1)
  );
}
