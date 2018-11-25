
import { interval, Observable } from "rxjs";
import { startWith, map, filter, take, mergeMap } from "rxjs/operators";
import { IOperatorOrObservable } from "./operator-or-observable";

function waitElementObservable(query: string, repeatDelay: number) {
    return interval(repeatDelay).pipe(
        startWith(0),
        map(() => <HTMLElement>document.querySelector(query)),
        filter(element => !!element),
        take(1),
    );
}
/**
 * @param query CSS selector text
 * @param repeatDelay Recheck time. Default is 200ms
 * @returns A stream that will infinitely check for the existence of an HTMLElement,
 * until it finds the required element or will be unsubscribed.
 * The stream returns the required HTMLElement.
 */
export function waitElement(query: string, repeatDelay = 200): IOperatorOrObservable<any, HTMLElement> {
    return (source?: Observable<any>) => {
        if (source) {
            return source.pipe(mergeMap(() => waitElementObservable(query, repeatDelay)));
        } else {
            return waitElementObservable(query, repeatDelay);
        }
    }
}