import { MonoTypeOperatorFunction, tap } from "rxjs";

function setInputValueImmediately(element: HTMLInputElement, value: string): void {
    element.value = value;
    element.focus();
    element.dispatchEvent(new Event('input'));
}

export function setInputValue(value: string): MonoTypeOperatorFunction<HTMLInputElement>;
export function setInputValue(element: HTMLInputElement, value: string): void;
export function setInputValue(
    elementOrValue: HTMLInputElement | string, value?: string
): MonoTypeOperatorFunction<HTMLInputElement> | void {
    if (typeof elementOrValue === 'string') {
        return tap((element: HTMLInputElement) => setInputValueImmediately(element, elementOrValue));
    } else {
        setInputValueImmediately(elementOrValue, value!);
    }
}
