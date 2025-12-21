import { MonoTypeOperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";

function blurElementImmediately(element: Element): void {
    if ('blur' in element) {
        (element as HTMLElement).blur();
    } else {
        element.dispatchEvent(new FocusEvent('blur'));
        element.dispatchEvent(new FocusEvent('focusout', {bubbles: true}));
    }
    console.log(`Blur: `, element);
}

export function blurElement<T extends Element>(): MonoTypeOperatorFunction<T>;
export function blurElement<T extends Element>(element: T): void;
export function blurElement<T extends Element>(element?: T): MonoTypeOperatorFunction<T> | void {
    if (element) {
        blurElementImmediately(element);
    } else {
        return tap((element: T) => blurElementImmediately(element));
    }
}
