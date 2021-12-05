import { EMPTY, from, merge, ObservableInput, ObservedValueOf, OperatorFunction } from "rxjs";
import { connect, filter, mergeMap, takeUntil } from "rxjs/operators";
import { IObserveElementChange } from "../observable/observe-query-selector";
import { IObservedElementsChanges } from "../observable/observe-query-selector-all";

export interface IMapElementChangeOptions {
    /**
     * If the `isTakeUntilRemoved` parameter is equal to the `true` value,
     * then each thread will be interrupted after the element is removed.
     * Only the stream that belongs to the deleted element is interrupted.
     * 
     * If the `isTakeUntilRemoved` parameter is equal to the `false` value,
     * then the converted streams will not be interrupted.
     */
    isTakeUntilRemoved?: boolean;
}

function assuredArray<T>(values?: T | T[]): T[] {
    if (values instanceof Array) {
        return values
    }
    if (values) {
        return [values];
    }
    return [];
}

/** Conversion operator to a new stream for each new added element */
export function mergeMapAddedElements<T extends Element, O extends ObservableInput<any>>(
    project: (element: T) => O,
    options?: IMapElementChangeOptions,
): OperatorFunction<
    IObservedElementsChanges<T> | IObserveElementChange<T>,
    ObservedValueOf<O>
> {
    if (!options?.isTakeUntilRemoved) {
        return source$ => source$.pipe(
            mergeMap(changes => {
                let added = assuredArray(changes.added);
                if (added.length === 0) {
                    return EMPTY;
                }
                let addedObservers = added.map(project);
                return merge(...addedObservers);
            })
        );
    }
    return source$ => source$.pipe(
        connect(connectedSource$ => connectedSource$.pipe(
            mergeMap(changes => {
                let added = assuredArray(changes.added);
                if (added.length === 0) {
                    return EMPTY;
                }
                
                let addedObservers = added.map(addedElement => 
                    from(
                        project(addedElement)
                    ).pipe(
                        takeUntil(
                            connectedSource$.pipe(
                                filter(changes => {
                                    if (changes.removed instanceof Array) {
                                        return changes.removed.indexOf(addedElement) != -1;
                                    } else {
                                        return changes.removed === addedElement;
                                    }
                                }),
                            ),
                        ),
                    ) as O,
                );
                return merge(...addedObservers);
            })
        )),
    );
}
