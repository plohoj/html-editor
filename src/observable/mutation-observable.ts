import { Observable } from "rxjs";

export function mutationObservable(node: Node, options?: MutationObserverInit): Observable<MutationRecord[]> {
    return new Observable<MutationRecord[]>(subscriber => {
        const mutationObserver = new MutationObserver(mutation => subscriber.next(mutation));
        mutationObserver.observe(node, options);
        return () => mutationObserver.disconnect();
    });
}