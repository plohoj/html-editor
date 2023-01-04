import { MonoTypeOperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";

export function removeElement<T extends Element>(): MonoTypeOperatorFunction<T> {
    return tap((element) => {
        element.remove();
        console.log(`Remove: `, element);
    });
}
