import { MonoTypeOperatorFunction, pipe } from "rxjs";
import { tap } from "rxjs/operators";

function clickElementImmediately(element: Element): void {
    element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    console.log(`Click: `, element);
}


export function clickElement<T extends Element>(): MonoTypeOperatorFunction<T>;
export function clickElement<T extends Element>(element: T): void;
export function clickElement<T extends Element>(element?: T): MonoTypeOperatorFunction<T> | void {
    if (element) {
        clickElementImmediately(element);
    } else {
        return pipe(
            tap((element: T) => clickElementImmediately(element)),
        );
    }
}
