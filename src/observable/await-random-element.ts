import { Observable } from "rxjs";
import { debounceTime, filter, map, take } from "rxjs/operators";
import { randomFromArray } from "../utils/random-from-array";
import { IAwaitElementOptions } from './await-element';
import { observeQuerySelectorAll } from "./observe-query-selector-all";

/**
 * Awaiting Expects at least one element to match the selector and returns it as an Rx stream.
 * If there are more than 1 elements, it will return a random one.
 * The stream ends after the elements are found / added.
 */
export function awaitRandomElement<T extends Element = Element>(
    query: string,
    options: IAwaitElementOptions<T> = {},
): Observable<T> {
    return observeQuerySelectorAll<T>(query, options)
        .pipe(
            debounceTime(options.debounceTime || 0, options.debounceScheduler),
            filter(changes => changes.target.length > 0),
            map(changes => randomFromArray(changes.target)),
            take(1)
        );
}
