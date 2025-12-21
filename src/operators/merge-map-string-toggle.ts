import { EMPTY, from, Observable, ObservableInput, ObservedValueOf, OperatorFunction, pipe } from "rxjs";
import { distinctUntilChanged, map, mergeMap, switchMap } from "rxjs/operators";
import { getStringConditionMatcher } from '../utils/get-string-condition-matcher';
import type { switchMapStringToggle } from './switch-map-string-toggle';

export interface IMergeMapStringToggleOptions {
    /**
     * If the `isTakeUntilToggle` parameter is equal to the `true` value,
     * the stream will be interrupted as soon as the source string fails validation.
     *
     * If the `isTakeUntilToggle` parameter is equal to the `false` value,
     * the stream will never be interrupted.
     * 
     * @default false
     * 
     * @deprecated
     * If {@link isTakeUntilToggle} is true,
     * this is the same as calling {@link switchMapStringToggle}(condition, project, {isTakeUntilToggle: true})  
     */
    isTakeUntilToggle?: boolean;
}

/**
 * The operator creates a separate stream when the source string is validated.
 * When a new stream is created, there is no unsubscription from the previous stream.
 */
export function mergeMapStringToggle<O extends ObservableInput<any>>(
    condition: RegExp | ((value: string) => boolean),
    project: () => O,
    options?: IMergeMapStringToggleOptions,
): OperatorFunction<string, ObservedValueOf<O>>;
/**@deprecated use a callback for the second parameter {@link project} */
export function mergeMapStringToggle<O extends ObservableInput<any>>(
    condition: RegExp | ((value: string) => boolean),
    project: O,
    options?: IMergeMapStringToggleOptions,
): OperatorFunction<string, ObservedValueOf<O>>;
export function mergeMapStringToggle<O extends ObservableInput<any>>(
    condition: RegExp | ((value: string) => boolean),
    project: (() => O) | O,
    options: IMergeMapStringToggleOptions = {},
): OperatorFunction<string, ObservedValueOf<O>> {
    let urlMatchToggler: (isUrlMatch: boolean) => Observable<ObservedValueOf<O>> = typeof project === 'function'
        ? (isStringMatch: boolean) => isStringMatch ? from(project()) : EMPTY
        : (isStringMatch: boolean) => isStringMatch ? from(project) : EMPTY;
    const mergeOperator = options.isTakeUntilToggle
        ? switchMap(urlMatchToggler)
        : mergeMap(urlMatchToggler);

    return pipe(
        map(getStringConditionMatcher(condition)),
        distinctUntilChanged(),
        mergeOperator
    )
}
