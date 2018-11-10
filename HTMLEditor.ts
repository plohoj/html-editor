import { Subject, Observable, of, OperatorFunction, pipe } from 'rxjs';
import { delayWhen, filter, switchMap, merge, takeUntil, delay, tap } from 'rxjs/operators';

export const historyChangeSubject = new Subject<string>();
document.addEventListener('hashchange', () => historyChangeSubject.next(location.href));
const pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    historyChangeSubject.next(location.href);
};

export function whenLocation(href: RegExp, flow: Observable<any>): Observable<string> {
    let isCoincidenceLast = false;
    let observableEmitter: Observable<any>;
    let observable = of(null)
        .pipe(
            delayWhen(() => historyChangeSubject
                .pipe(
                    filter(value => {
                        if (href.test(value)) {
                            if (isCoincidenceLast) {
                                return false;
                            } else {
                                isCoincidenceLast = true;
                                return true;                    
                            }
                        }
                        isCoincidenceLast = false;
                        return false;
                    })
                )
            ),
            switchMap(() => observableEmitter)
        )
    observableEmitter = observable.pipe(
        merge(
            flow.pipe(
                takeUntil(historyChangeSubject
                    .pipe(
                        filter(value => href.test(value))
                    )
                )
            ),
        )
    )
    if (href.test(location.href)) {
        isCoincidenceLast = true;
        return observableEmitter;
    }
    return <Observable<string>>observable;
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
                element.dispatchEvent(new Event('input', <EventInit>{target: element}));
                console.log(`I AM SET VALUE: "`, value, '" FROM', element);
            })
        );
}