import { BehaviorSubject, interval, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, skip, startWith, take, takeUntil, tap, windowCount } from 'rxjs/operators';

export const historyChange = new BehaviorSubject(location.href);
document.addEventListener('hashchange', () => historyChange.next(location.href));
const pushState = history.pushState;
history.pushState = function (...args) {
    pushState.apply(history, args);
    if (historyChange.value !== location.href) {
        historyChange.next(location.href);
    }
};

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
/**
 * @param query CSS selector text
 * @param repeatDelay Recheck time. Default is 200ms
 * @returns A stream that will infinitely check for the existence of an HTMLElement,
 * until it finds the required element or will be unsubscribed.
 * The stream returns the required HTMLElement.
 */
export function waitElement(query: string, repeatDelay = 200): Observable<HTMLElement> {
    return interval(repeatDelay).pipe(
        startWith(0),
        map(() => <HTMLElement>document.querySelector(query)),
        filter(element => !!element),
        take(1),
    );
}
export function waitElements(query: string, repeatDelay = 200): Observable<NodeListOf<HTMLElement>> {
    return interval(repeatDelay).pipe(
        startWith(0),
        map(() => <NodeListOf<HTMLElement>>document.querySelectorAll(query)),
        filter(elements => elements.length > 0),
        take(1),
    );
}

export function waitFromClick(query: string, repeatDelay?: number): Observable<HTMLElement> {
    return waitElement(query, repeatDelay).pipe(
        tap(element => {
            element.click();
            console.log(`Click: `, element);
        })
    );
}

export function waitFromRemove(query: string, repeatDelay?: number): Observable<HTMLElement> {
    return waitElement(query, repeatDelay).pipe(
        tap(element => {
            element.remove();
            console.log(`Remove: `, element);
        })
    )
}

export function waitFromSetValue(query: string, value: string, repeatDelay?: number): Observable<HTMLElement> {
    return waitElement(query, repeatDelay).pipe(
        tap((element: HTMLInputElement) => {
            element.value = value;
            element.dispatchEvent(new Event('input', <EventInit>{ target: element }));
            console.log(`Set value: "`, value, '" FROM', element);
        })
    );
}