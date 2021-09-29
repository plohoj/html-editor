import { Observable } from "rxjs";
import { filter, map, take } from "rxjs/operators";
import { randomFromArray } from "../operators/random-from-array";
import { observeQuerySelector } from "./observe-query-selector";
import { observeQuerySelectorAll } from "./observe-query-selector-all";

export function awaitRandomElement<T extends Element = Element>(query: string): Observable<T> {
    return observeQuerySelectorAll<T>(query)
        .pipe(
            filter(changes => !!changes.target),
            map(changes => randomFromArray(changes.target)),
            take(1),
        );
}
// TODO await removing element
export function awaitElement<T extends Element = Element>(query: string): Observable<T> {
    return observeQuerySelector<T>(query)
        .pipe(
            filter(changes => !!changes.target),
            map(changes => changes.target!),
            take(1),
        );
}
