import { Observable } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { randomFromArray } from "../utils/random-from-array";
import { observeQuerySelector } from "./observe-query-selector";
import { observeQuerySelectorAll } from "./observe-query-selector-all";

/**
 * Awaiting only one element to match the selector and returns it as an Rx stream.
 * The stream ends immediately after one element is found / added.
 */
export function awaitElement<T extends Element = Element>(query: string): Observable<T> {
    return observeQuerySelector<T>(query)
        .pipe(
            filter(changes => !!changes.target),
            map(changes => changes.target!),
            take(1),
        );
}

/**
 * Awaiting Expects at least one element to match the selector and returns it as an Rx stream.
 * If there are more than 1 elements,
 * it will return a random one. The stream ends immediately after the elements are found / added.
 */
export function awaitRandomElement<T extends Element = Element>(query: string): Observable<T> {
    return observeQuerySelectorAll<T>(query)
        .pipe(
            filter(changes => !!changes.target),
            map(changes => randomFromArray(changes.target)),
            take(1),
        );
}
