import { connect, EMPTY, filter, map, mergeMap, Observable, of, OperatorFunction, takeUntil } from "rxjs";

export interface IMergeMapByConditionOptions<I = unknown, O = unknown> {
  /** The condition that the source must satisfy */
  condition: (value: I) => boolean;
  /**
   * The function that will be called to generate a new stream
   * if the source changes and satisfies the {@link condition}.
   */
  project?: (source: I) => Observable<O>;
  /** 
   * Determines when the {@link project} function will be called to create a new stream:
   * * `'all'`: For each source changes that satisfies the {@link condition}.
   * * `'new'`: Only if the previous source failed the {@link condition} check.
   *
   * @default 'new'
   */
  takeFor?: 'all' | 'new';
  /** 
   * Determines when a stream from the {@link project} function should be terminated:
   * * `'fail'`: As soon as the source failed the {@link condition} check.
   * * `'pass'`: After the source failed the {@link condition} check and then successfully passes again.
   * * `'always'`: It does  not depend on whether the source passes the {@link condition} check or not.
   *
   * @default 'fail'
   */
  takeUntil?: 'fail' | 'pass' | 'always';
}

/** The operator creates a separate stream when the source is validated. */
export function mergeMapByCondition<I>(
  options: IMergeMapByConditionOptions<I> & { project?: undefined },
): OperatorFunction<I, I>;
export function mergeMapByCondition<I, O>(
  options: IMergeMapByConditionOptions<I, O>,
): OperatorFunction<I, O>;
export function mergeMapByCondition<I>(
  condition: (value: I) => boolean,
  project?: undefined,
  options?: Omit<IMergeMapByConditionOptions, 'condition' | 'project'>,
): OperatorFunction<I, I>;
export function mergeMapByCondition<I, O>(
  condition: (value: I) => boolean,
  project: (source: I) => Observable<O>,
  options?: Omit<IMergeMapByConditionOptions, 'condition' | 'project'>,
): OperatorFunction<I, O>;
export function mergeMapByCondition<I, O>(
  conditionOrOptions: ((value: I) => boolean) | IMergeMapByConditionOptions<I, O>,
  project?: ((source: I) => Observable<O>),
  options?: Omit<IMergeMapByConditionOptions, 'condition' | 'project'>,
): OperatorFunction<I, I | O> {
  // #region Options parsing
  let stableOptions: Omit<IMergeMapByConditionOptions, 'condition' | 'project'>;
  let conditionFn: (value: I) => boolean;
  let stableProject: ((source: I) => Observable<O>) | undefined;
  if ('condition' in conditionOrOptions) {
    stableOptions = conditionOrOptions;
    conditionFn = conditionOrOptions.condition;
    stableProject = conditionOrOptions.project;
  } else {
    conditionFn = conditionOrOptions;
    stableOptions = options || {};
    stableProject = project;
  }
  const {
    takeFor = 'new',
    takeUntil: takeUntilOption = 'fail',
  } = stableOptions;
  // #endregion

  let isPrevConditionPass = false;

  return source$ => source$.pipe(
    map(source => ({ source, isConditionPassed: conditionFn(source) })),
    connect(connectedSource$ => {
      let takeUntil$: Observable<unknown> | undefined;
      if (takeUntilOption === 'fail') {
        takeUntil$ = connectedSource$.pipe(
          filter(({ isConditionPassed }) => isConditionPassed)
        );
      } else if (takeUntilOption === 'pass') {
        let wasFailed = false
        takeUntil$ = connectedSource$.pipe(
          filter(({ isConditionPassed }) => {
            if (isConditionPassed) {
              if (wasFailed) {
                return true;
              }
            } else {
              wasFailed = true;
            }
            return false;
          })
        );
      }

      return connectedSource$.pipe( 
        mergeMap(({ source, isConditionPassed }) => {
          if (isConditionPassed) {
            const isCreateNewProject = takeFor === 'all' || !isPrevConditionPass;
            isPrevConditionPass = true;
    
            if (isCreateNewProject) {
              if (!stableProject) {
                return of(source);
              }
    
              let project$ = stableProject(source);
              if (takeUntil$) {
                project$ = project$.pipe(
                  takeUntil(takeUntil$)
                )
              }
              return project$;
            }
          } else {
            isPrevConditionPass = false;
          }
          return EMPTY;
        }),
      );
    }),
  );
}
