
import { interval, Observable } from "rxjs";
import { startWith, map, filter, take, mergeMap } from "rxjs/operators";
import { IOperatorOrObservable } from "./operator-or-observable";

function waitElementsObservable(query: string, repeatDelay: number) {
    return interval(repeatDelay).pipe(
        startWith(0),
        map(() => <NodeListOf<HTMLElement>>document.querySelectorAll(query)),
        filter(elements => elements.length > 0),
        take(1),
    );
}
/**
 * @param query CSS selector text
 * @param repeatDelay Recheck time. Default is 200ms
 * @returns A stream that will infinitely check for the existence of an HTMLElements,
 * until it finds the required elements or will be unsubscribed.
 * The stream returns the required HTMLElement.
 */
export function waitElements(query: string, repeatDelay = 200): IOperatorOrObservable<any, NodeListOf<HTMLElement>> {
    return (source?: Observable<any>) => {
        if (source) {
            return source.pipe(mergeMap(() => waitElementsObservable(query, repeatDelay)));
        } else {
            return waitElementsObservable(query, repeatDelay);
        }
    }
}