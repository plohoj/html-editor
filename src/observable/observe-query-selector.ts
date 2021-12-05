
import { concat, defer, EMPTY, Observable, of } from "rxjs";
import { distinctUntilChanged, mergeMap, switchMap, throttleTime } from "rxjs/operators";
import { observeElementMutation } from "./observe-mutation";

export interface IObserveQuerySelectorOptions<T extends Element = Element> {
    /** @default document.documentElement */
    parent?: T;
    has?: string;
    filter?: (element: T) => boolean;
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

    function checkChanges(): Observable<IObserveElementChange<T>> {
        const querySelectedElements: NodeListOf<T> = parent.querySelectorAll<T>(query);
        let filteredSelectedElement: T | undefined;
        const changes: IObserveElementChange<T> = {};

        for (const querySelectedElement of querySelectedElements) {
            if (options.has && !querySelectedElement.querySelector(options.has)) {
                continue;
            }
            if (options.filter && !options.filter(querySelectedElement)) {
                continue;
            }

            filteredSelectedElement = querySelectedElement;
            break;
        }

        if (filteredSelectedElement === targetElement) {
            return EMPTY;
        }
        if (targetElement) {
            changes.removed = targetElement;
        }
        if (filteredSelectedElement) {
            changes.added = filteredSelectedElement;
        }
        changes.target = filteredSelectedElement;
        targetElement = filteredSelectedElement;
        return of(changes);
    }

    const observeQuerySelector$ = concat(
        defer(() => checkChanges()),
        observeElementMutation(parent, {subtree: true, childList: true}).pipe(
            throttleTime(0, undefined, {leading: true, trailing: true}),
            mergeMap(checkChanges),
        )
    )

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