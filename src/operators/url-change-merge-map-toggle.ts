import { EMPTY, from, Observable, ObservableInput, ObservedValueOf, OperatorFunction, pipe } from "rxjs";
import { distinctUntilChanged, map, mergeMap, switchMap } from "rxjs/operators";

export interface IUrlChangeMergeMapToggleOptions {
    isTakeUntilToggle?: boolean;
}

export function urlChangeMergeMapToggle<O extends ObservableInput<any>>(
    condition: RegExp | ((url: string) => boolean),
    project: (() => O) | O,
    options?: IUrlChangeMergeMapToggleOptions,
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