import * as Rx from 'rxjs/Rx';
// whenLocation('http://stage:8080/#/',
//              waitHTMLElement.bind(null, 'app-ui-button.login-button', (element) => element.click()));

const historyChangeSubject = new Rx.Subject<string>();
document.addEventListener('hashchange', () => historyChangeSubject.next(location.href));
const pushState = history.pushState;
history.pushState = function () {
    pushState.apply(history, arguments);
    historyChangeSubject.next(location.href);
};
whenLocation('https://vk.com/feed', 
        waitHTMLElement('div.asd121123213123').do(element=> console.log(element))
    )
    .subscribe(element=> console.log(element));

function whenLocation<T>(href: string, flow: Rx.Observable<T>) {
    let observableEmitter: Rx.Observable<any>;
    let observable = Rx.Observable
        .of(null)
        .delayWhen(() => historyChangeSubject
            .filter(value => value == href))
        .switchMap(() => observableEmitter);
    observableEmitter = Rx.Observable.merge(
        flow.takeUntil(historyChangeSubject
            .filter(value => value != href)),
        observable
    );
    if (location.href === href) {
        return observableEmitter;
    }
    return observable;
}

function waitHTMLElement(query, queryRepeatDelay = 200): Rx.Observable<HTMLElement> {
    console.log('waitHTMLElement')
    var element = document.querySelector(query);
    if (element) {
        return Rx.Observable.of(element);
    }
    return Rx.Observable
        .of(null)
        .delay(queryRepeatDelay)
        .switchMap(() => waitHTMLElement(query, queryRepeatDelay));
}