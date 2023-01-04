import { concat, defer, EMPTY, ignoreElements, merge, MonoTypeOperatorFunction, NEVER, Observable, ObservableInput, of, share, takeUntil, tap } from 'rxjs';

export interface IRestoredHistoryOption<T = unknown> {
    getStory(): T | undefined;
    setStory(value: T): void;
    removeStory(): void;
    cancelRestore?: () => ObservableInput<unknown>;
};

export function restoreHistory<T>(
    options: IRestoredHistoryOption<T>
): MonoTypeOperatorFunction<T> {
    return (source$: Observable<T>) => {
        let hasStory = false;
        const observeCancel$ = options.cancelRestore
            ? defer(() => options.cancelRestore!())
                .pipe(
                    tap(() => {
                        if (hasStory) {
                            options.removeStory();
                        }
                    }),
                    share(),
                )
            : NEVER;
        const story$ = concat(
            defer(() => {
                const story = options.getStory();
                if (story === undefined) {
                    return EMPTY;
                }
                hasStory = true;
                let rested$ = of(story);
                if (options.cancelRestore) {
                    rested$ = rested$.pipe(takeUntil(observeCancel$))
                }
                return rested$;
            }),
            source$.pipe(
                tap((data: T) => {
                    options.setStory(data);
                    hasStory = true;
                }),
            ),
        );
        return merge(
            story$,
            observeCancel$.pipe(ignoreElements())
        );
    }
}
