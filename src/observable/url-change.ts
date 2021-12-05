import { Observable, Subscriber } from "rxjs";
import { distinctUntilChanged, shareReplay } from "rxjs/operators";

let pushStateSubscriber$: Subscriber<string> | undefined;
let isPushStateWasInjected = false;

function injectPushStateHandler(): void {
    if (isPushStateWasInjected) {
        return;
    }
    const pushState = history.pushState;
    history.pushState = function (...args) {
        pushState.apply(this, args);
        pushStateSubscriber$?.next(location.href);
    };
}

/**
 * Emit new location url when the URL is changes
 */
export const urlChange$ = new Observable<string>(subscriber$ => {
    function updateURL(): void {
        subscriber$.next(location.href)
    }    
    window.addEventListener('hashchange', updateURL);
    window.addEventListener('popstate', updateURL);
    pushStateSubscriber$ = subscriber$;
    subscriber$.next(location.href);
    injectPushStateHandler();
    return () => {
        pushStateSubscriber$ = undefined;
        window.removeEventListener('hashchange', updateURL);
        window.removeEventListener('popstate', updateURL);
    }
}).pipe(
    distinctUntilChanged(),
    shareReplay(1),
);
