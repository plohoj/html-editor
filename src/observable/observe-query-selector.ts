
import { concat, defer, distinctUntilChanged, EMPTY, mergeMap, Observable, of, switchMap, throttleTime } from "rxjs";
import { IMergeMapElementChangeOptions, mergeMapAddedElements } from '../operators/merge-map-added-elements';
import { trueStub } from '../utils/stubs';
import { observeElementMutation } from "./observe-mutation";

export interface IObserveQuerySelectorBaseOptions<T extends Element = Element> {
  query: string;
  /**
   * The parent element within which changes are tracked.
   * @default document.documentElement
   */
  parent?: Element;
  /** Checks if the added element has any child elements that match the query selectors. */
  has?: string;
  /** Custom validation of each item */
  filter?: (element: T) => boolean;
}

export interface IObserveQuerySelectorOptions<E extends Element = Element, O = unknown>
  extends IObserveQuerySelectorBaseOptions<E>, Omit<IMergeMapElementChangeOptions<E, O>, 'project'> {
  /**
   * * When the {@link asRemovedWhen} option emits a `true` value,
   * all currently added items will be returned as removed.
   * * When the {@link asRemovedWhen} option emits a `false` value,
   * the search will resume and all items will again be returned as added.
   */
  asRemovedWhen?: Observable<Boolean>;
  /**
   * The function that will be called to generate a new stream
   * for each element discovered the first time after it is added.
   */
  project?: (element: E) => Observable<O>;
  /**
   * The {@link tap} function will be called once for each element discovered the first time after it is added.
   * The {@link tap} function is called before the {@link project} function is called.
   */
  tap?: (element: E) => void,
}

export interface IObservedElementChange<T extends Element = Element> {
  /** Element that satisfy the filtering condition. */
  target?: T;
  /** New element that have been added since the last emit. */
  added?: T;
  /** Element that have been removed since the last emit. */
  removed?: T;
}

/** Observation changes (addition and deletion) of elements that match to query selectors as an Rx stream. */
export function observeQuerySelector<E extends Element = Element>(
  options: IObserveQuerySelectorOptions<E> & { project?: undefined },
): Observable<IObservedElementChange<E>>;
export function observeQuerySelector<E extends Element = Element, O = unknown>(
  options: IObserveQuerySelectorOptions<E, O>,
): Observable<O>;
export function observeQuerySelector<E extends Element = Element>(
  query: string,
  options?: Omit<IObserveQuerySelectorOptions<E>, 'query'> & { project?: undefined },
): Observable<IObservedElementChange<E>>;
export function observeQuerySelector<E extends Element = Element, O = unknown>(
  query: string,
  options: Omit<IObserveQuerySelectorOptions<E, O>, 'query'>,
): Observable<O>;
export function observeQuerySelector<E extends Element = Element, O = unknown>(
  query: string,
  project: ((element: E) => Observable<O>),
  options: Omit<IObserveQuerySelectorOptions<E>, 'query' | 'project'>,
): Observable<O>;
export function observeQuerySelector<E extends Element = Element, O = unknown>(
  queryOrOptions: string | IObserveQuerySelectorOptions<E, O>,
  projectOrOptions?: ((element: E) => Observable<O>) | Omit<IObserveQuerySelectorOptions<E, O>, 'query'>,
  options?: Omit<IObserveQuerySelectorOptions<E>, 'query' | 'project'>
): Observable<IObservedElementChange<E> | O> {
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

  let targetElement: E | undefined;

  function checkChanges(): Observable<IObservedElementChange<E>> {
    const querySelectedElements: NodeListOf<E> = parent.querySelectorAll<E>(query);
    let filteredSelectedElement: E | undefined;
    const changes: IObservedElementChange<E> = {};

    for (const querySelectedElement of querySelectedElements) {
      if (has && !querySelectedElement.querySelector(has)) {
        continue;
      }
      if (!filter(querySelectedElement)) {
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
      tap?.(filteredSelectedElement);
    }
    changes.target = filteredSelectedElement;
    targetElement = filteredSelectedElement;

    return of(changes);
  }

  const observeQuerySelector$: Observable<IObservedElementChange<E>> = concat(
    defer(() => checkChanges()),
    observeElementMutation(parent, { subtree: true, childList: true }).pipe(
      throttleTime(0, undefined, { leading: true, trailing: true }),
      mergeMap(checkChanges),
    )
  )

  let observeQuerySelectorWithRemovedWhen$ = observeQuerySelector$;

  if (asRemovedWhen) {
    const removedObserver$ = defer(() => {
      if (!targetElement) {
        return EMPTY;
      }
      const changes: IObservedElementChange<E> = {
        removed: targetElement,
      };
      targetElement = undefined;
      return of(changes);
    });

    observeQuerySelectorWithRemovedWhen$ = asRemovedWhen.pipe(
      distinctUntilChanged(),
      switchMap(asRemoved => asRemoved ? removedObserver$ : observeQuerySelector$),
    );
  }

  if (project) {
    return observeQuerySelectorWithRemovedWhen$.pipe(
      mergeMapAddedElements({
        project,
        ...restOfStableOptions,
      }),
    );
  }

  return observeQuerySelectorWithRemovedWhen$;
}
