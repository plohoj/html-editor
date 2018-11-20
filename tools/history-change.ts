import { BehaviorSubject } from "rxjs";

/**
 * Emit new location when the URL is changes
 */
export const historyChange = new BehaviorSubject(location.href);

document.addEventListener('hashchange', () => historyChange.next(location.href));
const pushState = history.pushState;
history.pushState = function (...args) {
    pushState.apply(history, args);
    if (historyChange.value !== location.href) {
        historyChange.next(location.href);
    }
};