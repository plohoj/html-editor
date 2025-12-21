import { from, ObservableInput, ObservedValueOf, OperatorFunction, pipe } from "rxjs";
import { connect, distinctUntilChanged, filter, map, switchMap, takeUntil } from "rxjs/operators";
import { getStringConditionMatcher } from '../utils/get-string-condition-matcher';

export interface ISwitchMapStringToggleOptions {
    /**
     * If the `isTakeUntilToggle` parameter is equal to the `true` value,
     * the stream will be interrupted as soon as the source string fails validation.
     *
     * If the `isTakeUntilToggle` parameter is equal to the `false` value,
     * the stream will be interrupted after the source stream fails validation and passes validation again.
     * 
     * @default false
     */
    isTakeUntilToggle?: boolean;
}

/**
 * The operator creates a separate stream when the source string is validated.
 * When a new stream is created, there is an unsubscription from the previous stream.
 */
export function switchMapStringToggle<O extends ObservableInput<any>>(
    condition: RegExp | ((value: string) => boolean),
    project: () => O,
    options: ISwitchMapStringToggleOptions = {}
): OperatorFunction<string, ObservedValueOf<O>> {
    return pipe(
        map(getStringConditionMatcher(condition)),
        distinctUntilChanged(),
        options.isTakeUntilToggle
            ? switchMap(() => from(project()))
            : connect(sharedCondition$ => sharedCondition$.pipe(
                filter(Boolean),
                switchMap(() => from(project()).pipe(
                    takeUntil(sharedCondition$.pipe(
                        filter(isStringMatch => !isStringMatch))
                    ),
                )),
            )),
    );
}
