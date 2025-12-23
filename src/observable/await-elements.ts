import { Observable, debounceTime, filter, map, take } from "rxjs";
import { IAwaitElementOptions } from './await-element';
import { observeQuerySelectorAll } from './observe-query-selector-all';

/**
 * Awaiting only first elements changes to match the selector and returns it as an Rx stream.
 * The stream ends after any element is found / added.
 */
export function awaitElements<T extends Element = Element>(
  options: IAwaitElementOptions<T>,
): Observable<T[]>;
export function awaitElements<T extends Element = Element>(
  query: string,
  options?: Omit<IAwaitElementOptions<T>, 'query'>,
): Observable<T[]>;
export function awaitElements<T extends Element = Element>(
  queryOrOptions: string | IAwaitElementOptions<T>,
  options?: Omit<IAwaitElementOptions<T>, 'query'>,
): Observable<T[]> {
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
    filter(changes => !!changes.target),
    map(changes => changes.target),
    take(1),
  );
}
