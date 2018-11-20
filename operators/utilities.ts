import { Observable, MonoTypeOperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";
import { elementActionBuilder } from "../tools/element-action-builder";

export const clickElement = elementActionBuilder(element => {
    element.click();
    console.log(`Click: `, element);
})

export const removeElement = elementActionBuilder(element => {
    element.remove();
    console.log(`Remove: `, element);
})

export function setValueElement(value): MonoTypeOperatorFunction<HTMLElement> {
    return (source: Observable<HTMLElement>) => 
        source.pipe(tap(element => {
            element['value'] = value;
            element.dispatchEvent(new Event('input', <EventInit>{ target: element }));
            console.log(`Set value: `, {element, value});
        }));
}