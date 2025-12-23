
import { concat, defer, distinctUntilChanged, EMPTY, mergeMap, Observable, of, switchMap, throttleTime } from "rxjs";
import { mergeMapAddedElements } from '../operators/merge-map-added-elements';
import { trueStub } from '../utils/stubs';
import { observeElementMutation } from "./observe-mutation";
import { IObserveQuerySelectorOptions } from "./observe-query-selector";

export interface IObservedElementsChanges<T extends Element = Element> {
  /** All elements that satisfy the filtering condition. */
  target: T[];
  /** New elements that have been added since the last emit. */
  added: T[];
  /** Elements that have been removed since the last emit. */
  removed: T[];
}

/** Observation changes (additions and deletions) of elements that match to query selectors as an Rx stream. */
export function observeQuerySelectorAll<E extends Element = Element>(
  options: IObserveQuerySelectorOptions<E, unknown> & { project?: undefined },
): Observable<IObservedElementsChanges<E>>;
export function observeQuerySelectorAll<E extends Element = Element, O = unknown>(
  options: IObserveQuerySelectorOptions<E, O>,
): Observable<O>;
export function observeQuerySelectorAll<E extends Element = Element>(
  query: string,
  options?: Omit<IObserveQuerySelectorOptions<E, unknown>, 'query'> & { project?: undefined },
): Observable<IObservedElementsChanges<E>>;
export function observeQuerySelectorAll<E extends Element = Element, O = unknown>(
  query: string,
  options: Omit<IObserveQuerySelectorOptions<E, O>, 'query'>,
): Observable<O>;
export function observeQuerySelectorAll<E extends Element = Element, O = unknown>(
  query: string,
  project: ((element: E) => Observable<O>),
  options: Omit<IObserveQuerySelectorOptions<E>, 'query' | 'project'>,
): Observable<O>;
export function observeQuerySelectorAll<E extends Element = Element, O = unknown>(
  queryOrOptions: string | IObserveQuerySelectorOptions<E, O>,
  projectOrOptions?: ((element: E) => Observable<O>) | Omit<IObserveQuerySelectorOptions<E, O>, 'query'>,
  options?: Omit<IObserveQuerySelectorOptions<E>, 'query' | 'project'>
): Observable<IObservedElementsChanges<E> | O> {
  // #region Options parsing
  let query: string;
  let project: ((element: E) => Observable<O>) | undefined;
  let stableOptions: Omit<IObserveQuerySelectorOptions<E>, 'query' | 'project'>;
  if (typeof queryOrOptions === 'string') {
    query = queryOrOptions;
    if (typeof projectOrOptions === 'function') {
      project = projectOrOptions;
      stableOptions = options || {};
    } else {
      stableOptions = projectOrOptions || {};
      project = projectOrOptions?.project;
    }
  } else {
    stableOptions = queryOrOptions;
    query = queryOrOptions.query;
    project = queryOrOptions?.project;
  }
  const {
    parent = document.documentElement,
    asRemovedWhen,
    filter = trueStub,
    has,
    tap,
    ...restOfStableOptions
  } = stableOptions;
  // #endregion

  const targetElements = new Set<E>();

  function checkChanges(): Observable<IObservedElementsChanges<E>> {
    const addedElements = new Set<E>();
    const targetElementsDiff = new Set(targetElements);
    const querySelectedElements = new Set(parent.querySelectorAll<E>(query));

    for (const querySelectedElement of querySelectedElements) {
      if (has && !querySelectedElement.querySelector(has)) {
        continue;
      }
      if (!filter(querySelectedElement)) {
        continue;
      }

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
      tap?.(addedElement);
    }

    const changes: IObservedElementsChanges<E> = {
      target: [...targetElements.values()],
      added: [...addedElements.values()],
      removed: [...targetElementsDiff.values()],
    }

    return of(changes);
  }

  const observeQuerySelectorAll$ = concat(
    defer(() => checkChanges()),
    observeElementMutation(parent, { subtree: true, childList: true }).pipe(
      throttleTime(0, undefined, { leading: true, trailing: true }),
      mergeMap(checkChanges)
    ),
  )

  let observeQuerySelectorAllWithRemovedWhen$ = observeQuerySelectorAll$;

  if (asRemovedWhen) {
    const removedObserver$ = defer(() => {
      if (targetElements.size === 0) {
        return EMPTY;
      }
      const changes: IObservedElementsChanges<E> = {
        target: [],
        added: [],
        removed: [...targetElements.values()],
      };
      targetElements.clear();
      return of(changes);
    });

    observeQuerySelectorAllWithRemovedWhen$ = asRemovedWhen.pipe(
      distinctUntilChanged(),
      switchMap(asRemoved => asRemoved ? removedObserver$ : observeQuerySelectorAll$),
    );
  }

  if (project) {
    return observeQuerySelectorAllWithRemovedWhen$.pipe(
      mergeMapAddedElements({
        project,
        ...restOfStableOptions,
      }),
    );
  }

  return observeQuerySelectorAllWithRemovedWhen$;
}
