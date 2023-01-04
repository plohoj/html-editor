import { Observable } from "rxjs";
import { debounceTime, filter, map, take } from "rxjs/operators";
import { IAwaitElementOptions } from './await-element';
import { observeQuerySelectorAll } from './observe-query-selector-all';

/**
 * Awaiting only first elements changes to match the selector and returns it as an Rx stream.
 * The stream ends after any element is found / added.
 */
export function awaitElements<T extends Element = Element>(
    query: string,
    options: IAwaitElementOptions<T> = {},
): Observable<T[]> {
    return observeQuerySelectorAll<T>(query, options).pipe(
        debounceTime(options.debounceTime || 0, options.debounceScheduler),
        filter(changes => !!changes.target),
        map(changes => changes.target!),
        take(1),
    );
}
