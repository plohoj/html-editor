import { MonoTypeOperatorFunction, pipe } from "rxjs";
import { tap } from "rxjs/operators";

export const clickElement = pipe(tap((element: HTMLElement) => {
    element.click();
    console.log(`Click: `, element);
}))

export const removeElement = pipe(tap((element: Element) => {
    element.remove();
    console.log(`Remove: `, element);
}));

export function setValueElement(value: string): MonoTypeOperatorFunction<HTMLInputElement> {
    return pipe(tap((element: HTMLInputElement) => {
        element.value = value;
        element.dispatchEvent(new Event('input', <EventInit>{ target: element }));
        console.log(`Set value: `, {element, value});
    }));
}