import { MonoTypeOperatorFunction, tap } from "rxjs";

export function removeElement<T extends Element>(): MonoTypeOperatorFunction<T> {
    return tap((element) => {
        element.remove();
    });
}
