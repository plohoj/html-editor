import { connect, EMPTY, filter, merge, mergeMap, Observable, OperatorFunction, takeUntil } from "rxjs";
import type { IObservedElementChange } from "../observable/observe-query-selector";
import type { IObservedElementsChanges } from "../observable/observe-query-selector-all";

export interface IMergeMapElementChangeOptions<E extends Element = Element, O = unknown> {
    /**
   * The function that will be called to generate a new stream
   * for each element discovered the first time after it is added.
   */
  project: (element: E) => Observable<O>;
  /** 
   * Determines when a stream from the {@link project} function should be terminated:
   * * `'removed'`: As soon as the element is removed.
   * * `'added'`: After the element is removed and (new one will discovered or have already been discovered before).
   * * `'always'`: streams will not be interrupted, after the element is removed.
   *
   * @default 'removed'
   */
  takeUntil?: 'removed' | 'added' | 'always';
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
export function mergeMapAddedElements<E extends Element, O = unknown>(
  options: IMergeMapElementChangeOptions<E, O>,
): OperatorFunction<IObservedElementsChanges<E> | IObservedElementChange<E>, O>;
export function mergeMapAddedElements<E extends Element, O = unknown>(
  project: (element: E) => Observable<O>,
  options?: Omit<IMergeMapElementChangeOptions, 'project'>,
): OperatorFunction<IObservedElementsChanges<E> | IObservedElementChange<E>, O>;
export function mergeMapAddedElements<E extends Element, O = unknown>(
  projectOrOptions: ((element: E) => Observable<O>) | IMergeMapElementChangeOptions<E, O>,
  options?: Omit<IMergeMapElementChangeOptions, 'project'>,
): OperatorFunction<IObservedElementsChanges<E> | IObservedElementChange<E>, O> {
  // #region Options parsing
  let project: (element: E) => Observable<O>;
  let stableOptions: Omit<IMergeMapElementChangeOptions, 'project'>;
  if (typeof projectOrOptions === 'function') {
    project = projectOrOptions;
    stableOptions = options || {};
  } else {
    project = projectOrOptions.project;
    stableOptions = projectOrOptions;
  }
  const { takeUntil: takeUntilOption = 'removed' } = stableOptions;
  // #endregion

  if (takeUntilOption === 'always') {
    return source$ => source$.pipe(
      mergeMap(changes => {
        const added = assuredArray(changes.added);
        if (added.length === 0) {
          return EMPTY;
        }
        const addedObservers = added.map(project);
        return merge(...addedObservers);
      })
    );
  }
  return source$ => source$.pipe(
    connect(connectedSource$ =>connectedSource$.pipe(
      mergeMap(changes => {
        const added = assuredArray(changes.added);
        if (added.length === 0) {
          return EMPTY;
        }

        const addedObservers = added.map(addedElement => {
          let takeUntil$: Observable<unknown> | undefined;
          if (takeUntilOption === 'removed') {
            takeUntil$ = connectedSource$.pipe(
              filter(connectedChanges => connectedChanges.removed instanceof Array
                ? connectedChanges.removed.indexOf(addedElement) !== -1
                : connectedChanges.removed === addedElement
              ),
            );
          } else {
            let wasRemoved = false
            takeUntil$ = connectedSource$.pipe(
              filter(connectedChanges => {
                if (!wasRemoved) {
                  wasRemoved = connectedChanges.removed instanceof Array
                    ? connectedChanges.removed.indexOf(addedElement) !== -1
                    : connectedChanges.removed === addedElement;
                }
                if (wasRemoved) {
                  const hasTarget = connectedChanges.target instanceof Array
                    ? connectedChanges.target.indexOf(addedElement) !== -1
                    : connectedChanges.target === addedElement;
                  return hasTarget;
                }
                return false;
              })
            );
          }

          return project(addedElement).pipe(
            takeUntil(takeUntil$),
          );
        });

        return merge(...addedObservers);
      })
    )),
  );
}
