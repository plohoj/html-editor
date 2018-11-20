import { Observable, MonoTypeOperatorFunction } from "rxjs";
import { tap } from "rxjs/operators";

export function elementActionBuilder(callback: (element: HTMLElement) => any): () => MonoTypeOperatorFunction<HTMLElement> {
    return () => (source: Observable<HTMLElement>) => source.pipe(tap(callback));
}