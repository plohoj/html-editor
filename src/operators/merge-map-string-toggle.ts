import { EMPTY, from, Observable, ObservableInput, ObservedValueOf, OperatorFunction, pipe } from "rxjs";
import { distinctUntilChanged, map, mergeMap, switchMap } from "rxjs/operators";

export interface IMergeMapStringToggleOptions {
    /**
     * If the `isTakeUntilToggle` parameter is equal to the `true` value,
     * the stream will be interrupted as soon as the source string fails validation.
     *
     * If the `isTakeUntilToggle` parameter is equal to the `false` value, the stream will never be interrupted.
     */
    isTakeUntilToggle?: boolean;
}

/** The operator creates a separate stream when the source string is validated. */
export function mergeMapStringToggle<O extends ObservableInput<any>>(
    condition: RegExp | ((url: string) => boolean),
    project: (() => O) | O,
    options?: IMergeMapStringToggleOptions,
): OperatorFunction<string, ObservedValueOf<O>> {
    const mapConditionFn = typeof condition === 'function' ? condition : (url: string) => condition.test(url);
    let urlMatchToggler: (isUrlMatch: Boolean) => Observable<ObservedValueOf<O>>;
    if (typeof project === 'function') {
        urlMatchToggler = (isUrlMatch: Boolean) => isUrlMatch ? from(project()) : EMPTY
    } else {
        urlMatchToggler = (isUrlMatch: Boolean) => isUrlMatch ? from(project) : EMPTY
    }
    const mergeOperator = options?.isTakeUntilToggle
        ? switchMap(urlMatchToggler)
        : mergeMap(urlMatchToggler);

    return pipe(
        map(mapConditionFn),
        distinctUntilChanged(),
        mergeOperator
    )
}
