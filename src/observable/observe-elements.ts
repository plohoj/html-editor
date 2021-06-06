
import { defer, EMPTY, Observable, of } from "rxjs";
import { distinctUntilChanged, mergeMap, startWith, switchMap, throttleTime } from "rxjs/operators";
import { mutationObservable } from "./mutation-observable";

export interface IObserveQuerySelectorAllOptions<T extends Element = Element> {
    query: string;
    parent?: T;
    asRemovedWhen?: Observable<Boolean>;
}

export interface IObserveQuerySelectorAllChanges<T extends Element = Element> {
    target: T[];
    added: T[];
    removed: T[];
}

export function observeQuerySelectorAll<T extends Element = Element>(
    options: IObserveQuerySelectorAllOptions,
): Observable<IObserveQuerySelectorAllChanges<T>> {
    const { query, parent = document.documentElement, asRemovedWhen } = options;
    const targetElements = new Set<T>();

    let observeQuerySelectorAll$ = mutationObservable(parent, {subtree: true, childList: true}).pipe(
        startWith(),
        throttleTime(0, undefined, {leading: true, trailing: true}),
        mergeMap(() => {
            const addedElements = new Set<T>();
            const targetElementsDiff = new Set(targetElements);
            const querySelectedElements = new Set(parent.querySelectorAll<T>(query));

            for (const querySelectedElement of querySelectedElements) {
                if (targetElementsDiff.has(querySelectedElement)) {
                    targetElementsDiff.delete(querySelectedElement);
                } else {
                    addedElements.add(querySelectedElement);
                }
            }

            // No changes
            if (addedElements.size === 0 && targetElementsDiff.size === 0) {
                return EMPTY;
            }

            for (const removedElement of targetElementsDiff) {
                targetElements.delete(removedElement);
            }
            for (const addedElement of addedElements) {
                targetElements.add(addedElement);
            }

            const changes: IObserveQuerySelectorAllChanges<T> = {
                target: [...targetElements.values()],
                added: [...addedElements.values()],
                removed: [...targetElementsDiff.values()],
            }

            return of(changes);
        })
    );

    if (asRemovedWhen) {
        const removedObserver$ = defer(() => {
            if (targetElements.size === 0) {
                return EMPTY;
            }
            const changes: IObserveQuerySelectorAllChanges<T> = {
                target: [],
                added: [],
                removed: [...targetElements.values()],
            };
            targetElements.clear();
            return of(changes);
        });

        const observeQuerySelectorAllWithRemovedWhen$ = asRemovedWhen.pipe(
            distinctUntilChanged(),
            switchMap(asRemoved => asRemoved ? removedObserver$ : observeQuerySelectorAll$),
        );

        return observeQuerySelectorAllWithRemovedWhen$;
    }

    return observeQuerySelectorAll$;
}