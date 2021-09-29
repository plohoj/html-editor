import { MonoTypeOperatorFunction, pipe } from "rxjs";
import { tap } from "rxjs/operators";

export function removeElement<T extends Element>(): MonoTypeOperatorFunction<T> {
    return pipe(tap((element) => {
        element.remove();
        console.log(`Remove: `, element);
    }));
}
