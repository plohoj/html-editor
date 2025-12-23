import { MonoTypeOperatorFunction, tap } from "rxjs";

function focusElementImmediately(element: Element): void {
    if ('focus' in element) {
        (element as HTMLElement).focus();
    } else {
        element.dispatchEvent(new FocusEvent('focus'));
        element.dispatchEvent(new FocusEvent('focusin', {bubbles: true}));
    }
    console.log(`Focus: `, element);
}

export function focusElement<T extends Element>(): MonoTypeOperatorFunction<T>;
export function focusElement<T extends Element>(element: T): void;
export function focusElement<T extends Element>(element?: T): MonoTypeOperatorFunction<T> | void {
    if (element) {
        focusElementImmediately(element);
    } else {
        return tap((element: T) => focusElementImmediately(element));
    }
}
