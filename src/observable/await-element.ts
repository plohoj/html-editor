import { Observable, SchedulerLike, debounceTime, filter, map, take } from "rxjs";
import { IObserveQuerySelectorBaseOptions, observeQuerySelector } from "./observe-query-selector";

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
export function awaitElement<T extends Element = Element>(
  options: IAwaitElementOptions<T>,
): Observable<T>;
export function awaitElement<T extends Element = Element>(
  query: string,
  options?: Omit<IAwaitElementOptions<T>, 'query'>,
): Observable<T>;
export function awaitElement<T extends Element = Element>(
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

  return observeQuerySelector<T>(query, stableOptions).pipe(
    debounceTime(stableOptions.debounceTime || 0, stableOptions.debounceScheduler),
    filter(changes => !!changes.target),
    map(changes => changes.target!),
    take(1),
  );
}
