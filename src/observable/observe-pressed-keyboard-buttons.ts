import { fromEvent, merge, Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
import { HasEventTargetAddRemove } from 'rxjs/internal/observable/fromEvent';

export interface IObservePressedKeyboardButtonsOptions {
    /** @default window */
    target?: HasEventTargetAddRemove<KeyboardEvent>
}

export function observePressedKeyboardButtons(
    options: IObservePressedKeyboardButtonsOptions = {}
): Observable<Set<string>> {
    const target = options.target || window;
    const set = new Set<string>();
    const addKey$ = merge(
        fromEvent(target, 'keydown'),
        fromEvent(target, 'keypress'),
    ).pipe(
        filter((event: KeyboardEvent) => !set.has(event.key)),
        tap((event: KeyboardEvent) => set.add(event.key)),
    )
    const keyRemove$ = fromEvent(target, 'keyup')
        .pipe(
            filter((event: KeyboardEvent) => set.has(event.key)),
            tap((event: KeyboardEvent) => set.delete(event.key)),
        );
    return merge(
        addKey$,
        keyRemove$,
    ).pipe(map(() => set));
}
