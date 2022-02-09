import { Observable, SchedulerLike } from "rxjs";
import { debounceTime, filter, map, take } from "rxjs/operators";
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
    query: string,
    options: IAwaitElementOptions<T> = {},
): Observable<T> {
    return observeQuerySelector<T>(query, options)
        .pipe(
            debounceTime(options.debounceTime || 0, options.debounceScheduler),
            filter(changes => !!changes.target),
            map(changes => changes.target!),
            take(1),
        );
}
