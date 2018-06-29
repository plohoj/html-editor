import * as Rx from 'rxjs/Rx';

const historyChangeSubject = new Rx.Subject<string>();
document.addEventListener('hashchange', () => historyChangeSubject.next(location.href));
const pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    historyChangeSubject.next(location.href);
};
function whenLocation(href: RegExp, flow: Rx.Observable<any>): Rx.Observable<string> {
    let isCoincidenceLast = false;
    let observableEmitter: Rx.Observable<any>;
    let observable = Rx.Observable
        .of(null)
        .delayWhen(() => historyChangeSubject
        .filter(value => {
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
        }))
        .switchMap(() => observableEmitter);
    observableEmitter = Rx.Observable.merge(
        flow.takeUntil(historyChangeSubject
            .filter(value => href.test(value))),
        observable
    );
    if (href.test(location.href)) {
        isCoincidenceLast = true;
        return observableEmitter;
    }
    return <Rx.Observable<string>>observable;
}
function waitHTMLElement(query, queryRepeatDelay = 200): Rx.Observable<HTMLElement> {
    var element = document.querySelector(query);
    if (element) {
        return Rx.Observable.of(element);
    }
    return Rx.Observable
        .of(null)
        .delay(queryRepeatDelay)
        .switchMap(() => waitHTMLElement(query, queryRepeatDelay));
}