import { MonoTypeOperatorFunction, tap } from "rxjs";

function clickElementImmediately(element: Element): void {
    if ('click' in element) {
        (element as HTMLElement).click();
    } else {
        element.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }
    console.log(`Click: `, element);
}

export function clickElement<T extends Element>(): MonoTypeOperatorFunction<T>;
export function clickElement<T extends Element>(element: T): void;
export function clickElement<T extends Element>(element?: T): MonoTypeOperatorFunction<T> | void {
    if (element) {
        clickElementImmediately(element);
    } else {
        return tap((element: T) => clickElementImmediately(element));
    }
}
