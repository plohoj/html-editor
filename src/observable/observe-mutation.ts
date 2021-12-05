import { Observable } from "rxjs";

/**
 * Converts the callback of the MutationObserver class to an Rx event stream
 */
export function observeElementMutation<T extends Node>(node: T, options?: MutationObserverInit): Observable<MutationRecord[]> {
    return new Observable<MutationRecord[]>(subscriber => {
        const mutationObserver = new MutationObserver(mutation => subscriber.next(mutation));
        mutationObserver.observe(node, options);
        return () => mutationObserver.disconnect();
    });
}
