import { Observable, debounceTime, filter, map, take } from "rxjs";
import { IAwaitElementOptions } from './await-element';
import { QuerySelectorQueryFn } from './observe-query-selector';
import { observeQuerySelectorAll } from './observe-query-selector-all';

/**
 * Awaiting only first elements changes to match the selector and returns it as an Rx stream.
 * The stream ends after any element is found / added.
 */
export function awaitElements<E extends Element = Element>(
  options: IAwaitElementOptions<E>,
): Observable<E[]>;
export function awaitElements<E extends Element = Element>(
  query: string | QuerySelectorQueryFn<E>,
  options?: Omit<IAwaitElementOptions<E>, 'query'>,
): Observable<E[]>;
export function awaitElements<E extends Element = Element>(
  queryOrOptions: string | QuerySelectorQueryFn<E> | IAwaitElementOptions<E>,
  options?: Omit<IAwaitElementOptions<E>, 'query'>,
): Observable<E[]> {
  // #region Options parsing
  const stableOptions: Omit<IAwaitElementOptions<E>, 'query'>
    = typeof queryOrOptions === 'string' || typeof queryOrOptions === 'function'
      ? options || {}
      : queryOrOptions
  // #endregion

  return observeQuerySelectorAll<E>(queryOrOptions as string, options).pipe(
    debounceTime(stableOptions.debounceTime || 0, stableOptions.debounceScheduler),
    filter(changes => !!changes.target),
    map(changes => changes.target),
    take(1),
  );
}
