import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, distinctUntilChanged, filter, map, skip, switchMap, takeUntil, tap, windowCount } from 'rxjs/operators';

export const historyChange = new BehaviorSubject(location.href);
document.addEventListener('hashchange', () => historyChange.next(location.href));
const pushState = history.pushState;
history.pushState = function (...args) {
    pushState.apply(history, args);
    if (historyChange.value !== location.href) {
        historyChange.next(location.href);
    }
};

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

export function waitHTMLElement(query: string, queryRepeatDelay = 200): Observable<HTMLElement> {
    var element = document.querySelector(query);
    if (element) {
        return of(<HTMLElement>element);
    }
    return of(null)
        .pipe(
            delay(queryRepeatDelay),
            switchMap(() => waitHTMLElement(query, queryRepeatDelay))
        )
}

export function waitFromClick(query: string) {
    return waitHTMLElement(query)
        .pipe(
            tap(element => {
                element.click()
                console.log(`I AM CLICKED: `, element);
            })
        )
}

export function waitFromRemove(query: string) {
    return waitHTMLElement(query)
        .pipe(
            tap(element => {
                element.remove()
                console.log(`I AM REMOVED: `, element);
            })
        )
}

export function waitFromSetValue(query: string, value: string) {
    return waitHTMLElement(query)
        .pipe(
            tap((element: HTMLInputElement) => {
                element.value = value;
                element.dispatchEvent(new Event('input', <EventInit>{ target: element }));
                console.log(`I AM SET VALUE: "`, value, '" FROM', element);
            })
        );
}