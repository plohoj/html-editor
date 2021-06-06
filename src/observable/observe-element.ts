
import { defer, EMPTY, Observable, of } from "rxjs";
import { distinctUntilChanged, map, startWith, switchMap, throttleTime } from "rxjs/operators";
import { mutationObservable } from "./mutation-observable";
import { IObserveQuerySelectorAllOptions } from "./observe-elements";

export interface IObserveQuerySelectorOptions<T extends Element = Element> {
    query: string;
    parent?: T;
    asRemovedWhen?: Observable<Boolean>;
}

export interface IObserveQuerySelectorChanges<T extends Element = Element> {
    target?: T;
    added?: T;
    removed?: T;
}

export function observeQuerySelector<T extends Element = Element>(
    options: IObserveQuerySelectorAllOptions,
): Observable<IObserveQuerySelectorChanges<T>> {
    const { query, parent = document.documentElement, asRemovedWhen } = options;
    let targetElement: T | undefined;

    const observeQuerySelector$ = mutationObservable(parent, {subtree: true, childList: true}).pipe(
        startWith(),
        throttleTime(0, undefined, {leading: true, trailing: true}),
        switchMap(() => {
            const querySelectedElement: T | undefined = parent.querySelector<T>(query) || undefined;
            const changes: IObserveQuerySelectorChanges<T> = {};

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
            const changes: IObserveQuerySelectorChanges<T> = {
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