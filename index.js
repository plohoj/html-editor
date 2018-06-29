"use strict";
const historyChangeSubject = new Rx.Subject();
document.addEventListener('hashchange', () => historyChangeSubject.next(location.href));
const pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    historyChangeSubject.next(location.href);
};
function whenLocation(href, flow) {
    let isCoincidenceLast = false;
    let observableEmitter;
    let observable = Rx.Observable
        .of(null)
        .delayWhen(() => historyChangeSubject
        .filter(value => {
        if (href.test(value)) {
            if (isCoincidenceLast) {
                return false;
            }
            else {
                isCoincidenceLast = true;
                return true;
            }
        }
        isCoincidenceLast = false;
        return false;
    }))
        .switchMap(() => observableEmitter);
    observableEmitter = Rx.Observable.merge(flow.takeUntil(historyChangeSubject
        .filter(value => href.test(value))), observable);
    if (href.test(location.href)) {
        isCoincidenceLast = true;
        return observableEmitter;
    }
    return observable;
}
function waitHTMLElement(query, queryRepeatDelay = 200) {
    var element = document.querySelector(query);
    if (element) {
        return Rx.Observable.of(element);
    }
    return Rx.Observable
        .of(null)
        .delay(queryRepeatDelay)
        .switchMap(() => waitHTMLElement(query, queryRepeatDelay));
}
