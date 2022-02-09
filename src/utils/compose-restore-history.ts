import { merge, MonoTypeOperatorFunction, ReplaySubject } from 'rxjs';
import { IRestoredHistoryOption, restoreHistory } from '../operators/restore-history';

export type ComposedRestoredHistoryOptionList<T extends IRestoredHistoryOption = IRestoredHistoryOption> = readonly T[] | Record<string, T>;

export type ComposedRestoredHistoryOperatorsRecord<T extends Record<string, IRestoredHistoryOption>> = {
    [P in keyof T]: T[P] extends IRestoredHistoryOption<infer Input>
        ? MonoTypeOperatorFunction<Input>
        : never;
}

export type ComposedRestoredHistoryOperatorsArray<T extends readonly IRestoredHistoryOption[]> = {
    [P in keyof T]: T[P] extends IRestoredHistoryOption<infer Input>
        ? MonoTypeOperatorFunction<Input>
        : never;
}

export type ComposedRestoredHistoryOperatorsList<T extends ComposedRestoredHistoryOptionList>
    = T extends Array<any>
        ? ComposedRestoredHistoryOperatorsArray<T>
        : T extends Record<string, any>
            ? ComposedRestoredHistoryOperatorsRecord<T>
            : never;

export interface IComposedRestoredHistory<T extends ComposedRestoredHistoryOptionList> {
    operators: ComposedRestoredHistoryOperatorsList<T>;
    cancelAll: () => void;
}

export function composeRestoreHistory<T extends ComposedRestoredHistoryOptionList>(
    options: T,
): IComposedRestoredHistory<T> {
    const cancelSubject$ = new ReplaySubject<void>(1);
    function cancelAll(): void {
        cancelSubject$.next();
    }
    function convertOption(option: IRestoredHistoryOption): MonoTypeOperatorFunction<unknown> {
        return restoreHistory({
            ...option,
            cancelRestore: !!option.cancelRestore
                ? () => merge(
                    cancelSubject$,
                    option.cancelRestore!(),
                )
                : () => cancelSubject$,
        });
    }
    let operators: ComposedRestoredHistoryOperatorsList<T>;
    if (options instanceof Array) {
        operators = options.map(convertOption) as readonly MonoTypeOperatorFunction<any>[] as ComposedRestoredHistoryOperatorsList<T>;
    } else {
        operators = {} as Record<string, MonoTypeOperatorFunction<any>> as ComposedRestoredHistoryOperatorsList<T>;
        for (const key of Object.keys(options)) {
            (operators as Record<string, MonoTypeOperatorFunction<any>>)[key] = convertOption(options[key]);
        }        
    }
    return {
        operators: operators as ComposedRestoredHistoryOperatorsList<T>,
        cancelAll,
    };
}
