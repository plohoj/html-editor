import { Observable, SchedulerLike, debounceTime, filter, map, take } from "rxjs";
import { IObserveQuerySelectorBaseOptions, observeQuerySelector, QuerySelectorQueryFn } from "./observe-query-selector";

export interface IAwaitElementOptions<T extends Element = Element> extends IObserveQuerySelectorBaseOptions<T> {
  /**
   * The time to wait for elements changes.
   * If during the waiting time the elements have changed the timer will be reset.
   * @default 0
   */
  debounceTime?: number;
  debounceScheduler?: SchedulerLike;
}

/**
 * Awaiting only one element to match the selector and returns it as an Rx stream.
 * The stream ends after one element is found / added.
 */
export function awaitElement<E extends Element = Element>(
  options: IAwaitElementOptions<E>,
): Observable<E>;
export function awaitElement<E extends Element = Element>(
  query: string | QuerySelectorQueryFn<E>,
  options?: Omit<IAwaitElementOptions<E>, 'query'>,
): Observable<E>;
export function awaitElement<E extends Element = Element>(
  queryOrOptions: string | QuerySelectorQueryFn<E> | IAwaitElementOptions<E>,
  options?: Omit<IAwaitElementOptions<E>, 'query'>,
): Observable<E> {
  // #region Options parsing
  const stableOptions: Omit<IAwaitElementOptions<E>, 'query'>
    = typeof queryOrOptions === 'string' || typeof queryOrOptions === 'function'
      ? options || {}
      : queryOrOptions
  // #endregion

  return observeQuerySelector<E>(queryOrOptions as string, options).pipe(
    debounceTime(stableOptions.debounceTime || 0, stableOptions.debounceScheduler),
    filter(changes => !!changes.target),
    map(changes => changes.target!),
    take(1),
  );
}
