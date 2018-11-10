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

export function waitElement(query: string, repeatDelay = 200): Observable<HTMLElement> {
    return interval(repeatDelay).pipe(
        startWith(0),
        map(() => <HTMLElement>document.querySelector(query)),
        filter(element => !!element),
        take(1),
    );
}

export function waitFromClick(query: string, repeatDelay?: number) {
    return waitElement(query, repeatDelay).pipe(
        tap(element => {
            element.click();
            console.log(`Click: `, element);
        })
    );
}

export function waitFromRemove(query: string, repeatDelay?: number) {
    return waitElement(query, repeatDelay).pipe(
        tap(element => {
            element.remove();
            console.log(`Remove: `, element);
        })
    )
}

export function waitFromSetValue(query: string, value: string, repeatDelay?: number) {
    return waitElement(query, repeatDelay).pipe(
        tap((element: HTMLInputElement) => {
            element.value = value;
            element.dispatchEvent(new Event('input', <EventInit>{ target: element }));
            console.log(`Set value: "`, value, '" FROM', element);
        })
    );
}