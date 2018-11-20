import { Observable } from "rxjs";
import { historyChange } from "../tools/history-change";
import { distinctUntilChanged, filter, windowCount, skip, map, takeUntil } from "rxjs/operators";

/**
 * @param href expected URL
 * @returns A stream inside stream that expects a URL transition.
 * That stream will be automatically unsubscribed
 * if the transition to the url is not met satisfying the RegExp condition.
 * The stream emits a string parameter - URL.
 */
export function whenURL(href: RegExp): Observable<Observable<string>> {
    return historyChange.pipe(
        distinctUntilChanged(),
        filter(url => href.test(url)),
        windowCount(1),
        skip(1),
        map(() => historyChange.pipe(
            takeUntil(historyChange.pipe(
                filter(url => !href.test(url)),
            )),
        )),
    );
}
