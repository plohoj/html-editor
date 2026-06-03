import { Observable, debounceTime, filter, map, take } from "rxjs";
import { randomFromArray } from "../utils/random-from-array";
import { IAwaitElementOptions } from './await-element';
import { observeQuerySelectorAll } from "./observe-query-selector-all";
import { QuerySelectorQueryFn } from './observe-query-selector';

/**
 * Awaiting Expects at least one element to match the selector and returns it as an Rx stream.
 * If there are more than 1 elements, it will return a random one.
 * The stream ends after the elements are found / added.
 */
export function awaitRandomElement<E extends Element = Element>(
  options: IAwaitElementOptions<E>,
): Observable<E>;
export function awaitRandomElement<E extends Element = Element>(
  query: string | QuerySelectorQueryFn<E>,
  options?: Omit<IAwaitElementOptions<E>, 'query'>,
): Observable<E>;
export function awaitRandomElement<E extends Element = Element>(
  queryOrOptions: string | QuerySelectorQueryFn<E> | IAwaitElementOptions<E>,
  options?: Omit<IAwaitElementOptions<E>, 'query'>,
): Observable<E> {
  // #region Options parsing
  const stableOptions: Omit<IAwaitElementOptions<E>, 'query'>
    = typeof queryOrOptions === 'string' || typeof queryOrOptions === 'function'
      ? options || {}
      : queryOrOptions;
  // #endregion

  return observeQuerySelectorAll<E>(queryOrOptions as string, stableOptions).pipe(
    debounceTime(stableOptions.debounceTime || 0, stableOptions.debounceScheduler),
    filter(changes => changes.target.length > 0),
    map(changes => randomFromArray(changes.target)),
    take(1)
  );
}
