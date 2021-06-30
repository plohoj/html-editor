import { MonoTypeOperatorFunction, pipe } from "rxjs";
import { tap } from "rxjs/operators";

export function removeElement <T extends Element>(): MonoTypeOperatorFunction<T> {
    return pipe(tap((element) => {
        element.remove();
        console.log(`Remove: `, element);
    }));
}

export function setValueElement(value: string): MonoTypeOperatorFunction<HTMLInputElement> {
    return pipe(tap((element: HTMLInputElement) => {
        element.value = value;
        element.dispatchEvent(new Event('input', <EventInit>{ target: element }));
        console.log(`Set value: `, {element, value});
    }));
}

export function clickElement<T extends Element>(): MonoTypeOperatorFunction<T> {
    return pipe(tap((element) => {
        element.dispatchEvent(new MouseEvent('click', {bubbles: true}));
        console.log(`Click: `, element);
    }));
}