
import { defer, EMPTY, Observable, of } from "rxjs";
import { distinctUntilChanged, startWith, switchMap, throttleTime } from "rxjs/operators";
import { observeElementMutation } from "./observe-mutation";

export interface IObserveQuerySelectorOptions<T extends Element = Element> {
    parent?: T;
    asRemovedWhen?: Observable<Boolean>;
}

export interface IObserveElementChange<T extends Element = Element> {
    target?: T;
    added?: T;
    removed?: T;
}

export function observeQuerySelector<T extends Element = Element>(
    query: string,
    options: IObserveQuerySelectorOptions = {},
): Observable<IObserveElementChange<T>> {
    const { parent = document.documentElement, asRemovedWhen } = options;
    let targetElement: T | undefined;

    // TODO first check and emit before add event listener
    const observeQuerySelector$ = observeElementMutation(parent, {subtree: true, childList: true}).pipe(
        startWith(null),
        throttleTime(0, undefined, {leading: true, trailing: true}),
        switchMap(() => {
            const querySelectedElement: T | undefined = parent.querySelector<T>(query) || undefined;
            const changes: IObserveElementChange<T> = {};

            if (querySelectedElement === targetElement) {
                return EMPTY;
            }
            if (targetElement) {
                changes.removed = targetElement;
            }
            if (querySelectedElement) {
                changes.added = querySelectedElement;
            }
            changes.target = querySelectedElement;
            targetElement = querySelectedElement;
            return of(changes);
        }),
    );

    if (asRemovedWhen) {
        const removedObserver$ = defer(() => {
            if (!targetElement) {
                return EMPTY;
            }
            const changes: IObserveElementChange<T> = {
                removed: targetElement,
            };
            targetElement = undefined;
            return of(changes);
        });

        const observeQuerySelectorWithRemovedWhen$ = asRemovedWhen.pipe(
            distinctUntilChanged(),
            switchMap(asRemoved => asRemoved ? removedObserver$ : observeQuerySelector$),
        );

        return observeQuerySelectorWithRemovedWhen$;
    }

    return observeQuerySelector$;
}